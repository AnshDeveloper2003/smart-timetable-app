import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new batch (faculty/admin only)
export async function POST(req: Request) {
  try {
    const { name, department, year, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can create batches" }, { status: 403 });
    }

    const batch = await prisma.batch.create({
      data: { name, department, year: parseInt(year) },
    });

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    console.error("Create Batch Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// List all batches
export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: { users: true, events: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ batches });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}