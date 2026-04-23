import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${monthAgo.toISOString()}&timeMax=${now.toISOString()}`,
    { headers: { Authorization: authHeader } }
  );
  const data = await res.json();
  const events = data.items || [];

  const dayCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hourCount: Record<number, number> = {};
  let totalMinutes = 0;

  events.forEach((event: any) => {
    const start = new Date(event.start?.dateTime || event.start?.date);
    const end = new Date(event.end?.dateTime || event.end?.date);
    dayCount[days[start.getDay()] as keyof typeof dayCount]++;
    const hour = start.getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
    const duration = (end.getTime() - start.getTime()) / 60000;
    if (duration > 0 && duration < 480) totalMinutes += duration;
  });

  const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
  const busiestHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];

  return NextResponse.json({
    totalEvents: events.length,
    totalHours: Math.round(totalMinutes / 60),
    busiestDay: busiestDay ? `${busiestDay[0]} (${busiestDay[1]} events)` : "N/A",
    busiestHour: busiestHour ? `${busiestHour[0]}:00 (${busiestHour[1]} events)` : "N/A",
    dayCount,
    avgEventsPerDay: Math.round(events.length / 30),
  });
}