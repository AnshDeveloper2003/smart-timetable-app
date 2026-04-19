import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get task lists first
  const listRes = await fetch(
    "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  const listData = await listRes.json();
  const taskListId = listData.items?.[0]?.id;

  if (!taskListId) {
    return NextResponse.json({ tasks: [] });
  }

  // Get tasks from first list
  const tasksRes = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=false`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  const tasksData = await tasksRes.json();
  return NextResponse.json({ tasks: tasksData.items || [] });
}