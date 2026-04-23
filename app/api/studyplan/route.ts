import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, hoursNeeded } = await req.json();

    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true&timeMin=${now.toISOString()}&timeMax=${weekLater.toISOString()}`,
      { headers: { Authorization: authHeader } }
    );
    const data = await res.json();
    const events = data.items || [];

    const freeSlots = [];
    for (let i = 0; i < events.length - 1; i++) {
      const currentEnd = new Date(events[i].end?.dateTime || events[i].end?.date);
      const nextStart = new Date(events[i + 1].start?.dateTime || events[i + 1].start?.date);
      const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000;
      if (gapMinutes >= 60) {
        freeSlots.push({
          start: currentEnd.toLocaleString(),
          end: nextStart.toLocaleString(),
          durationHours: Math.round(gapMinutes / 60)
        });
      }
    }

    const prompt = `
      You are a smart academic scheduler.
      Subject to study: ${subject}
      Hours needed: ${hoursNeeded}
      Available free slots this week: ${JSON.stringify(freeSlots)}
      Upcoming events: ${JSON.stringify(events.slice(0, 5).map((e: any) => ({ title: e.summary, start: e.start?.dateTime })))}
      Create a specific study plan using the free slots.
      Suggest which slots to use, how long to study each time, and study tips.
      Be concise and practical.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });

    const plan = response.choices[0].message.content;
    return NextResponse.json({ plan, freeSlots });

  } catch (error: any) {
    console.error("Study Plan Error:", error?.message);
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}