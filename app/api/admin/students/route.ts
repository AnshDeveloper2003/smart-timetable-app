import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, email: true, name: true, batchId: true, batch: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}