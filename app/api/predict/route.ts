import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
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

    const dayCount: Record<string, number> = {};
    const hourCount: Record<number, number> = {};
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    events.forEach((event: any) => {
      const start = new Date(event.start?.dateTime || event.start?.date);
      const day = days[start.getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
      const hour = start.getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const busiestDays = Object.entries(dayCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);
    const busiestHours = Object.entries(hourCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => `${h}:00`);
    const quietDays = Object.entries(dayCount).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([d]) => d);

    const prompt = `
      Based on this student's 30-day calendar pattern:
      - Busiest days: ${busiestDays.join(', ')}
      - Busiest hours: ${busiestHours.join(', ')}
      - Quietest days: ${quietDays.join(', ')}
      - Total events: ${events.length}

      Provide 5 specific actionable scheduling recommendations.
      Include best times to schedule study sessions, exams, and meetings.
      Be specific with day and time suggestions.
      Format as numbered list.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
    });

    const predictions = response.choices[0].message.content;
    return NextResponse.json({
      predictions,
      patterns: { busiestDays, busiestHours, quietDays, totalEvents: events.length }
    });

  } catch (error: any) {
    console.error("Predict Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}