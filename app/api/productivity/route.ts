import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch last 30 days events
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${monthAgo.toISOString()}&timeMax=${now.toISOString()}`,
      { headers: { Authorization: authHeader } }
    );
    const data = await res.json();
    const events = data.items || [];

    // Fetch this week events
    const weekRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true&timeMin=${weekAgo.toISOString()}&timeMax=${now.toISOString()}`,
      { headers: { Authorization: authHeader } }
    );
    const weekData = await weekRes.json();
    const weekEvents = weekData.items || [];

    // Calculate metrics
    const totalEvents = events.length;
    const weeklyEvents = weekEvents.length;
    const avgPerDay = totalEvents / 30;

    // Score components
    let score = 0;
    const breakdown = [];

    // 1. Consistency score (20 points)
    const daysWithEvents = new Set(events.map((e: any) =>
      new Date(e.start?.dateTime || e.start?.date).toDateString()
    )).size;
    const consistencyScore = Math.min(20, Math.round((daysWithEvents / 30) * 20));
    score += consistencyScore;
    breakdown.push({ label: "Schedule Consistency", score: consistencyScore, max: 20, icon: "📅" });

    // 2. Activity level (20 points)
    const activityScore = Math.min(20, Math.round(avgPerDay * 5));
    score += activityScore;
    breakdown.push({ label: "Activity Level", score: activityScore, max: 20, icon: "⚡" });

    // 3. This week activity (20 points)
    const weekScore = Math.min(20, Math.round(weeklyEvents * 3));
    score += weekScore;
    breakdown.push({ label: "This Week's Activity", score: weekScore, max: 20, icon: "🔥" });

    // 4. Event variety (20 points)
    const uniqueTitles = new Set(events.map((e: any) => e.summary)).size;
    const varietyScore = Math.min(20, Math.round((uniqueTitles / totalEvents) * 20));
    score += varietyScore;
    breakdown.push({ label: "Schedule Variety", score: varietyScore, max: 20, icon: "🌈" });

    // 5. Scheduling ahead (20 points)
    const futureRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=${now.toISOString()}`,
      { headers: { Authorization: authHeader } }
    );
    const futureData = await futureRes.json();
    const futureEvents = futureData.items || [];
    const planningScore = Math.min(20, futureEvents.length * 3);
    score += planningScore;
    breakdown.push({ label: "Forward Planning", score: planningScore, max: 20, icon: "🎯" });

    // Grade
    let grade = "F";
    let message = "";
    let color = "red";

    if (score >= 90) { grade = "A+"; message = "Outstanding! You are highly productive!"; color = "emerald"; }
    else if (score >= 80) { grade = "A"; message = "Excellent productivity score!"; color = "green"; }
    else if (score >= 70) { grade = "B"; message = "Good job! Keep it up!"; color = "blue"; }
    else if (score >= 60) { grade = "C"; message = "Average. Try to be more consistent."; color = "yellow"; }
    else if (score >= 50) { grade = "D"; message = "Below average. Schedule more activities."; color = "orange"; }
    else { grade = "F"; message = "Low productivity. Start scheduling today!"; color = "red"; }

    return NextResponse.json({
      score,
      grade,
      message,
      color,
      breakdown,
      totalEvents,
      weeklyEvents,
      daysWithEvents
    });

  } catch (error: any) {
    console.error("Productivity Error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}