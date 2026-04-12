import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const schedules = await prisma.paymentSchedule.findMany({
    where: { status: { in: ["UPCOMING", "OVERDUE"] } },
    orderBy: { dueDate: "asc" },
    include: {
      booking: {
        include: {
          customer: true,
          unit: { include: { project: true } },
        },
      },
    },
  });

  return NextResponse.json({
    schedules: schedules.map((s) => ({
      id: s.id,
      instalmentNo: s.instalmentNo,
      label: s.label,
      dueDate: s.dueDate.toISOString(),
      amount: s.amount.toString(),
      status: s.status,
      bookingRef: s.booking.bookingRef,
      customerName: s.booking.customer.name,
      projectName: s.booking.unit.project.name,
    })),
  });
}
