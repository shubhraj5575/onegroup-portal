import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/api-auth";
import { uploadFile } from "@/lib/s3";

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "OTHER";
    const title = (formData.get("title") as string) || file.name;
    const customerId = formData.get("customerId") as string | null;
    const bookingId = formData.get("bookingId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 25MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `documents/${Date.now()}-${file.name}`;
    await uploadFile(key, buffer, file.type);

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && auth.user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: { userId: auth.user.userId },
      });
      resolvedCustomerId = customer?.id || null;
    }

    const isAdmin = auth.user.role === "ADMIN" || auth.user.role === "SUPER_ADMIN";

    const document = await prisma.document.create({
      data: {
        customerId: resolvedCustomerId,
        bookingId,
        type,
        title,
        fileUrl: key,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: isAdmin ? "ADMIN" : "CUSTOMER",
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
