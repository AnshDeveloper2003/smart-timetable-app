import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check session AND token exist
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=" + new Date().toISOString(),
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // Make sure this line exists
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}