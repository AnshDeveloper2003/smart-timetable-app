import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { email, name, subject, hours, plan } = await req.json();

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || "" },
      create: { email, name: name || "" },
    });

    const savedPlan = await prisma.studyPlan.create({
      data: {
        subject,
        hours: parseInt(hours),
        plan,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, plan: savedPlan });

  } catch (error: any) {
    console.error("SavePlan Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ plans: [] });

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studyPlans: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
    });

    return NextResponse.json({ plans: user?.studyPlans || [] });

  } catch (error: any) {
    console.error("GetPlans Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}