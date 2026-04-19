import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key is missing" }, { status: 500 });
    }

    const { messages, calendarData, conflicts, freeSlots, tasks } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const systemPrompt = `
      You are a Smart Timetable Assistant.
      Here is the user's Google Calendar data: ${JSON.stringify(calendarData?.slice(0, 5))}
      Conflicts: ${JSON.stringify(conflicts?.slice(0, 3))}
      Free slots: ${JSON.stringify(freeSlots?.slice(0, 3))}
      Tasks: ${JSON.stringify(tasks?.slice(0, 5))}
      Use this data to answer questions about their schedule.
      Be concise and helpful.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: lastMessage }
      ],
      max_tokens: 500,
    });

    const text = response.choices[0].message.content;
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Groq Chat Error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "AI failed" }, { status: 500 });
  }
}
