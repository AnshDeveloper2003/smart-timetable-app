import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, events } = await req.json();

    if (!to) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const eventList = events.slice(0, 5).map((e: any) =>
      `<li><b>${e.summary}</b> - ${new Date(e.start?.dateTime || e.start?.date).toLocaleString()}</li>`
    ).join('');

    await transporter.sendMail({
      from: `"Smart Timetable Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Upcoming Schedule Reminder",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Smart Timetable Assistant</h2>
          <p>Here are your upcoming events:</p>
          <ul>${eventList}</ul>
          <p style="color: #64748B; font-size: 12px;">Powered by Smart Timetable Assistant</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent!" });

  } catch (error: any) {
    console.error("Email Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}