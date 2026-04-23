import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
    { headers: { Authorization: authHeader } }
  );
  const data = await response.json();
  return NextResponse.json(data);
}