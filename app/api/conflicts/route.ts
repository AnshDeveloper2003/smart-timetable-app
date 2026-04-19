import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

function detectConflicts(events: any[]) {
  const conflicts = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      const aStart = new Date(a.start?.dateTime || a.start?.date);
      const aEnd = new Date(a.end?.dateTime || a.end?.date);
      const bStart = new Date(b.start?.dateTime || b.start?.date);
      const bEnd = new Date(b.end?.dateTime || b.end?.date);

      if (aStart < bEnd && aEnd > bStart) {
        conflicts.push({
          event1: { title: a.summary, start: aStart, end: aEnd },
          event2: { title: b.summary, start: bStart, end: bEnd },
          message: `"${a.summary}" and "${b.summary}" overlap!`
        });
      }
    }
  }
  return conflicts;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  const data = await res.json();
  const conflicts = detectConflicts(data.items || []);
  return NextResponse.json({ conflicts, total: conflicts.length });
}