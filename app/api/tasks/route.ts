import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listRes = await fetch(
    "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
    { headers: { Authorization: authHeader } }
  );
  const listData = await listRes.json();
  const taskListId = listData.items?.[0]?.id;
  if (!taskListId) return NextResponse.json({ tasks: [] });

  const tasksRes = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=false`,
    { headers: { Authorization: authHeader } }
  );
  const tasksData = await tasksRes.json();
  return NextResponse.json({ tasks: tasksData.items || [] });
}