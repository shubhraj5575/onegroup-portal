import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { z } from "zod";

const schema = z.object({
  batchId: z.string(),
  verifiedData: z.record(z.string(), z.string()),
});

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { batchId, verifiedData } = parsed.data;

    const batch = await prisma.importBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch || batch.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Batch not found or not pending review" },
        { status: 400 }
      );
    }

    // Validate required fields
    const required = ["applicant_name", "applicant_phone", "project_name", "unit_number", "total_price"];
    for (const field of required) {
      if (!verifiedData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Update batch with verified data
    await prisma.importBatch.update({
      where: { id: batchId },
      data: {
        verifiedData: JSON.stringify(verifiedData),
        status: "VERIFIED",
        processedBy: auth.user.userId,
      },
    });

    // Create records in a transaction
    await prisma.$transaction(async (tx) => {
      // Find or create project
      let project = await tx.project.findFirst({
        where: { name: verifiedData.project_name },
      });

      if (!project) {
        project = await tx.project.create({
          data: {
            name: verifiedData.project_name,
            city: verifiedData.city || "Unknown",
            state: verifiedData.state || "Unknown",
            type: "RESIDENTIAL",
          },
        });
      }

      // Find or create unit
      let unit = await tx.unit.findFirst({
        where: {
          projectId: project.id,
          unitNumber: verifiedData.unit_number,
        },
      });

      if (!unit) {
        unit = await tx.unit.create({
          data: {
            projectId: project.id,
            unitNumber: verifiedData.unit_number,
            unitType: verifiedData.unit_type || "Plot",
            areaSqFt: verifiedData.area_sqft ? parseFloat(verifiedData.area_sqft) : null,
            basePricePSF: verifiedData.base_price_psf ? parseFloat(verifiedData.base_price_psf) : null,
            totalPrice: parseFloat(verifiedData.total_price),
            paymentPlanType:
              verifiedData.payment_plan_type === "CONSTRUCTION_LINKED"
                ? "CONSTRUCTION_LINKED"
                : verifiedData.payment_plan_type === "FLEXI"
                ? "FLEXI"
                : "DOWN_PAYMENT",
          },
        });
      }

      // Create user for customer
      const phone = verifiedData.applicant_phone.replace(/\D/g, "").slice(-10);
      let user = await tx.user.findUnique({ where: { phone } });

      if (!user) {
        user = await tx.user.create({
          data: { phone, role: "CUSTOMER" },
        });
      }

      // Create customer
      let customer = await tx.customer.findUnique({
        where: { userId: user.id },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            userId: user.id,
            name: verifiedData.applicant_name,
            phone,
            email: verifiedData.applicant_email || null,
            address: verifiedData.applicant_address || null,
            panNumber: verifiedData.pan_number || null,
            aadhaarNumber: verifiedData.aadhaar_number || null,
          },
        });
      }

      // Create booking
      const bookingRef = verifiedData.unit_number;
      const booking = await tx.booking.create({
        data: {
          bookingRef: `${bookingRef}-${Date.now()}`,
          customerId: customer.id,
          unitId: unit.id,
          bookingDate: verifiedData.booking_date
            ? new Date(verifiedData.booking_date)
            : new Date(),
          totalAmount: parseFloat(verifiedData.total_price),
          importBatchId: batchId,
        },
      });

      // Create initial payment schedule (booking amount)
      if (verifiedData.booking_amount) {
        await tx.paymentSchedule.create({
          data: {
            bookingId: booking.id,
            instalmentNo: 1,
            label: "Booking Amount",
            dueDate: new Date(),
            amount: parseFloat(verifiedData.booking_amount),
            status: "UPCOMING",
          },
        });
      }

      // Co-applicant
      if (verifiedData.co_applicant_name) {
        await tx.coApplicant.create({
          data: {
            bookingId: booking.id,
            name: verifiedData.co_applicant_name,
            phone: verifiedData.co_applicant_phone || null,
            relationship: verifiedData.co_applicant_relationship || null,
          },
        });
      }
    });

    // Mark as imported
    await prisma.importBatch.update({
      where: { id: batchId },
      data: { status: "IMPORTED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify import error:", error);
    return NextResponse.json(
      { error: "Import verification failed" },
      { status: 500 }
    );
  }
}
