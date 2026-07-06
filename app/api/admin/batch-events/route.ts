import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Push new event to batch
export async function POST(req: Request) {
  try {
    const { title, description, startTime, endTime, type, batchId, requesterEmail } = await req.json();

    const requester = await prisma.user.findUnique({ where: { email: requesterEmail } });
    if (!requester || (requester.role !== "FACULTY" && requester.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only faculty or admin can push batch events" }, { status: 403 });
    }

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

    return NextResponse.json({ success: true, event });
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
      include: { batch: { include: { events: { orderBy: { startTime: "asc" } } } } },
    });

    if (!student?.batch) {
      return NextResponse.json({ events: [], message: "Student not assigned to a batch yet" });
    }

    return NextResponse.json({ events: student.batch.events, batchName: student.batch.name });
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