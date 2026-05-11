import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key missing" }, { status: 500 });
    }

    const { messages, calendarData, conflicts, freeSlots, tasks } = await req.json();

    const systemPrompt = `
      You are a Smart Timetable Assistant with memory of the conversation.
      Google Calendar Events: ${JSON.stringify(calendarData?.slice(0, 8))}
      Conflicts: ${JSON.stringify(conflicts?.slice(0, 3))}
      Free Slots: ${JSON.stringify(freeSlots?.slice(0, 3))}
      Tasks: ${JSON.stringify(tasks?.slice(0, 5))}
      Answer questions about the user's schedule concisely and helpfully.
      Remember previous messages in this conversation.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      max_tokens: 600,
    });

    const text = response.choices[0].message.content;
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Groq Chat Error:", error?.message);
    return NextResponse.json({ error: error?.message || "AI failed" }, { status: 500 });
  }
}