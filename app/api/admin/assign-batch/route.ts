import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Assign student to batch
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

// Remove student from batch
export async function DELETE(req: Request) {
  try {
    const { studentEmail, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can remove students" }, { status: 403 });
    }

    const student = await prisma.user.update({
      where: { email: studentEmail },
      data: { batchId: null },
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error("Remove Batch Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}