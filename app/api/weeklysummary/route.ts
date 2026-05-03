import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, events, analytics } = await req.json();

    if (!to) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const thisWeekEvents = events.filter((e: any) => {
      const start = new Date(e.start?.dateTime || e.start?.date);
      return start >= now && start <= weekLater;
    });

    const eventList = thisWeekEvents.length > 0
      ? thisWeekEvents.map((e: any) =>
          `<li><b>${e.summary}</b> - ${new Date(e.start?.dateTime || e.start?.date).toLocaleString()}</li>`
        ).join('')
      : '<li>No events this week</li>';

    await transporter.sendMail({
      from: `"Smart Timetable Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Weekly Schedule Summary",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3B82F6;">Weekly Schedule Summary</h2>
          <div style="background: #F1F5F9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0;">This Week Events (${thisWeekEvents.length})</h3>
            <ul style="margin: 0; padding-left: 20px;">${eventList}</ul>
          </div>
          ${analytics ? `
          <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0;">Your Stats (Last 30 Days)</h3>
            <p style="margin: 5px 0;">Total Events: <b>${analytics.totalEvents}</b></p>
            <p style="margin: 5px 0;">Total Hours: <b>${analytics.totalHours}h</b></p>
            <p style="margin: 5px 0;">Busiest Day: <b>${analytics.busiestDay}</b></p>
            <p style="margin: 5px 0;">Avg Events/Day: <b>${analytics.avgEventsPerDay}</b></p>
          </div>` : ''}
          <p style="color: #64748B; font-size: 12px; margin-top: 20px;">
            Powered by Smart Timetable Assistant
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Weekly summary sent!" });

  } catch (error: any) {
    console.error("Weekly Summary Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}