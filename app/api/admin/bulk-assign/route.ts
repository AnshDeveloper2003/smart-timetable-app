import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { emails, batchId, requesterEmail } = await req.json();

    // Check requester is admin/faculty
    const requester = await prisma.user.findUnique({
      where: { email: requesterEmail }
    });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can bulk assign" }, { status: 403 });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    if (!batchId) {
      return NextResponse.json({ error: "No batch selected" }, { status: 400 });
    }

    const results = {
      assigned: [] as string[],
      created: [] as string[],
      failed: [] as string[],
    };

    for (const rawEmail of emails) {
      const email = rawEmail.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        results.failed.push(rawEmail);
        continue;
      }

      try {
        // Upsert — create student if they don't exist yet, then assign to batch
        await prisma.user.upsert({
          where: { email },
          update: { batchId },
          create: {
            email,
            role: "STUDENT",
            batchId,
            preferences: {
              create: { theme: "dark", notifyEmail: true },
            },
          },
        });

        const existed = await prisma.user.findUnique({ where: { email } });
        if (existed?.googleId) {
          results.assigned.push(email);
        } else {
          results.created.push(email);
        }
      } catch {
        results.failed.push(email);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: emails.length,
        assigned: results.assigned.length,
        created: results.created.length,
        failed: results.failed.length,
      },
      details: results,
    });

  } catch (error: any) {
    console.error("Bulk Assign Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}