import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const typeColor: Record<string, string> = {
  exam: "#F87171",
  holiday: "#34D399",
  deadline: "#FCD34D",
  class: "#6366F1",
};

const typeEmoji: Record<string, string> = {
  exam: "📝",
  holiday: "🎉",
  deadline: "⏰",
  class: "📚",
};

async function sendBatchEventEmail(
  studentEmails: string[],
  batchName: string,
  event: any
) {
  if (studentEmails.length === 0) return;

  const color = typeColor[event.type] || "#6366F1";
  const emoji = typeEmoji[event.type] || "📅";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E8EDF7; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1E3A8A, #7C3AED); padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: white;">Smart Timetable Assistant</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">${batchName}</p>
      </div>
      <div style="padding: 28px 32px;">
        <div style="background: rgba(255,255,255,0.05); border-left: 4px solid ${color}; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
          <div style="font-size: 11px; color: #6B7A99; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">New ${event.type} added</div>
          <div style="font-size: 18px; font-weight: 600; color: #E8EDF7; margin-bottom: 4px;">${emoji} ${event.title}</div>
          ${event.description ? `<div style="font-size: 13px; color: #8899BB; margin-top: 6px;">${event.description}</div>` : ''}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #6B7A99; width: 120px;">Start</td>
            <td style="padding: 8px 0; font-size: 13px; color: #C5D0E8;">${new Date(event.startTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #6B7A99;">End</td>
            <td style="padding: 8px 0; font-size: 13px; color: #C5D0E8;">${new Date(event.endTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #6B7A99;">Type</td>
            <td style="padding: 8px 0; font-size: 13px; color: ${color}; font-weight: 500; text-transform: capitalize;">${event.type}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #6B7A99;">Batch</td>
            <td style="padding: 8px 0; font-size: 13px; color: #C5D0E8;">${batchName}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
          <a href="${process.env.NEXTAUTH_URL || 'https://smart-timetable-app-1xgf.vercel.app'}"
            style="display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;">
            View in Smart Timetable
          </a>
        </div>
      </div>
      <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); font-size: 11px; color: #4A5568; text-align: center;">
        Smart Timetable Assistant · Powered by AI
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Smart Timetable Assistant" <${process.env.EMAIL_USER}>`,
    bcc: studentEmails.join(","),
    subject: `${emoji} ${event.type === 'exam' ? 'Exam Scheduled' : event.type === 'holiday' ? 'Holiday Announced' : event.type === 'deadline' ? 'Deadline Added' : 'Class Scheduled'}: ${event.title} — ${batchName}`,
    html,
  });
}

// Push new event to batch + notify students
export async function POST(req: Request) {
  try {
    const { title, description, startTime, endTime, type, batchId, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can push batch events" }, { status: 403 });
    }

    // Create the event
    const event = await prisma.batchEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        batchId,
      },
    });

    // Fetch batch name + students with email notifications enabled
    const [batch, studentsWithEmail] = await Promise.all([
      prisma.batch.findUnique({
        where: { id: batchId },
        select: { name: true }
      }),
      prisma.user.findMany({
        where: {
          batchId,
          preferences: { notifyEmail: true }
        },
        select: { email: true }
      })
    ]);

    const emailList = studentsWithEmail.map(s => s.email).filter(Boolean) as string[];

    // Send emails in background
    if (emailList.length > 0 && batch) {
      sendBatchEventEmail(emailList, batch.name, {
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
      }).catch(err => console.error("Email send error:", err));
    }

    return NextResponse.json({
      success: true,
      event,
      notified: emailList.length,
    });

  } catch (error: any) {
    console.error("Create Batch Event Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// Get all events for a student's batch
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentEmail = searchParams.get("email");

    if (!studentEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: {
        batch: {
          include: { events: { orderBy: { startTime: "asc" } } }
        }
      },
    });

    if (!student?.batch) {
      return NextResponse.json({ events: [], message: "Student not assigned to a batch yet" });
    }

    return NextResponse.json({
      events: student.batch.events,
      batchName: student.batch.name
    });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// Edit an existing batch event
export async function PUT(req: Request) {
  try {
    const { eventId, title, description, startTime, endTime, type, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can edit events" }, { status: 403 });
    }

    const event = await prisma.batchEvent.update({
      where: { id: eventId },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Edit Event Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// Delete a batch event
export async function DELETE(req: Request) {
  try {
    const { eventId, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can delete events" }, { status: 403 });
    }

    await prisma.batchEvent.delete({ where: { id: eventId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Event Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}