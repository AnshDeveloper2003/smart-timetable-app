import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true&timeMin=${now.toISOString()}&timeMax=${weekLater.toISOString()}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  const data = await res.json();
  const events = data.items || [];

  // Find gaps between events (min 1 hour free slots)
  const freeSlots = [];
  for (let i = 0; i < events.length - 1; i++) {
    const currentEnd = new Date(events[i].end?.dateTime || events[i].end?.date);
    const nextStart = new Date(events[i + 1].start?.dateTime || events[i + 1].start?.date);
    const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000;

    if (gapMinutes >= 60) {
      freeSlots.push({
        start: currentEnd,
        end: nextStart,
        durationMinutes: Math.round(gapMinutes),
        label: `${Math.round(gapMinutes / 60)}h free slot`
      });
    }
  }

  return NextResponse.json({ freeSlots, total: freeSlots.length });
}