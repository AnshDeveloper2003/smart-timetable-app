import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const { messages, calendarData, conflicts, freeSlots, tasks } = await req.json();

    const systemContent = `
      You are an intelligent Smart Timetable Agent with access to the user's schedule data.
      
      CALENDAR EVENTS: ${JSON.stringify(calendarData?.slice(0, 10))}
      CONFLICTS: ${JSON.stringify(conflicts?.slice(0, 5))}
      FREE SLOTS: ${JSON.stringify(freeSlots?.slice(0, 5))}
      TASKS: ${JSON.stringify(tasks?.slice(0, 8))}
      CURRENT TIME: ${new Date().toLocaleString()}
      
      You can help with:
      1. Finding free time slots for study or meetings
      2. Detecting and resolving scheduling conflicts
      3. Creating optimized study schedules
      4. Analyzing productivity patterns
      5. Suggesting best times for important tasks
      
      Always be specific with dates and times from the calendar data.
      Be concise, helpful, and actionable in your responses.
    `;

    const langchainMessages = [
      new SystemMessage(systemContent),
      ...messages.map((m: any) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      )
    ];

    const response = await model.invoke(langchainMessages);
    const text = response.content.toString();

    return NextResponse.json({ text, agent: true });

  } catch (error: any) {
    console.error("Agent Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}