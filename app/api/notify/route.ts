import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { events } = await req.json();

    // Get today's and tomorrow's events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents = events.filter((e: any) => {
      const start = new Date(e.start?.dateTime || e.start?.date);
      return start >= now && start <= tomorrow;
    });

    if (upcomingEvents.length === 0) {
      return NextResponse.json({ message: "No upcoming events in next 24 hours" });
    }

    // Generate reminder message using AI
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a friendly reminder message for these upcoming events in next 24 hours: ${JSON.stringify(upcomingEvents.map((e: any) => ({ title: e.summary, start: e.start?.dateTime || e.start?.date })))}. Be brief and motivating.`
      }],
      max_tokens: 200,
    });

    const reminder = response.choices[0].message.content;

    return NextResponse.json({
      reminder,
      upcomingEvents: upcomingEvents.length,
      events: upcomingEvents.map((e: any) => ({
        title: e.summary,
        start: new Date(e.start?.dateTime || e.start?.date).toLocaleString()
      }))
    });

  } catch (error: any) {
    console.error("Notify Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}