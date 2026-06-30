import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { studentEmail, batchId, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can assign batches" }, { status: 403 });
    }

    const student = await prisma.user.update({
      where: { email: studentEmail },
      data: { batchId },
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error("Assign Batch Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}