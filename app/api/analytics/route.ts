import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${monthAgo.toISOString()}&timeMax=${now.toISOString()}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  const data = await res.json();
  const events = data.items || [];

  // Events per day of week
  const dayCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Events per week
  const weekCount: Record<string, number> = {};

  // Busiest hours
  const hourCount: Record<number, number> = {};

  // Total duration
  let totalMinutes = 0;

  events.forEach((event: any) => {
    const start = new Date(event.start?.dateTime || event.start?.date);
    const end = new Date(event.end?.dateTime || event.end?.date);

    // Day of week
    const day = days[start.getDay()];
    dayCount[day as keyof typeof dayCount]++;

    // Week number
    const weekKey = `Week ${Math.ceil(start.getDate() / 7)}`;
    weekCount[weekKey] = (weekCount[weekKey] || 0) + 1;

    // Hour
    const hour = start.getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;

    // Duration
    const duration = (end.getTime() - start.getTime()) / 60000;
    if (duration > 0 && duration < 480) totalMinutes += duration;
  });

  // Busiest day
  const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];

  // Busiest hour
  const busiestHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];

  return NextResponse.json({
    totalEvents: events.length,
    totalHours: Math.round(totalMinutes / 60),
    busiestDay: busiestDay ? `${busiestDay[0]} (${busiestDay[1]} events)` : "N/A",
    busiestHour: busiestHour ? `${busiestHour[0]}:00 (${busiestHour[1]} events)` : "N/A",
    dayCount,
    weekCount,
    hourCount,
    avgEventsPerDay: Math.round(events.length / 30),
  });
}