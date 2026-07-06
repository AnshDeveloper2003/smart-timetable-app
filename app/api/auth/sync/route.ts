import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: Request) {
  try {
    const { email, name, photoURL, googleId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const isTrustedAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    const existing = await prisma.user.findUnique({ where: { email } });

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        photoURL,
        googleId,
        // Only auto-promote, never auto-demote an existing FACULTY/ADMIN
        role: isTrustedAdmin ? "ADMIN" : existing?.role,
      },
      create: {
        email,
        name,
        photoURL,
        googleId,
        role: isTrustedAdmin ? "ADMIN" : "STUDENT",
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