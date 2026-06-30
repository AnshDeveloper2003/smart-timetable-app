import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, name, photoURL, googleId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, photoURL, googleId },
      create: {
        email,
        name,
        photoURL,
        googleId,
        role: "STUDENT",
        preferences: {
          create: { theme: "dark", notifyEmail: true },
        },
      },
      include: { preferences: true, batch: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Sync Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}