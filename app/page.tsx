'use client';
import { useState } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from 'next/dynamic';

const FullCalendarView = dynamic(() => import('./components/FullCalendarView'), { ssr: false });

export default function Home() {
  const { data: session } = useSession();

  // States
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [input, setInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [freeSlots, setFreeSlots] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [studySubject, setStudySubject] = useState("");
  const [studyHours, setStudyHours] = useState("3");
  const [studyPlan, setStudyPlan] = useState("");
  const [loadingStudyPlan, setLoadingStudyPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar'|'conflicts'|'slots'|'tasks'|'analytics'|'study'>('calendar');
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [reminder, setReminder] = useState("");
  const [loadingReminder, setLoadingReminder] = useState(false);

  const fetchCalendar = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.error) alert("Error: " + JSON.stringify(data.error));
      else setEvents(data.items || []);
    } catch { alert("Failed to fetch calendar."); }
    finally { setLoadingEvents(false); }
  };

  const fetchConflicts = async () => {
    setLoadingConflicts(true);
    try {
      const res = await fetch('/api/conflicts');
      const data = await res.json();
      setConflicts(data.conflicts || []);
      setActiveTab('conflicts');
    } catch { alert("Failed to fetch conflicts."); }
    finally { setLoadingConflicts(false); }
  };

  const fetchFreeSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch('/api/freeslots');
      const data = await res.json();
      setFreeSlots(data.freeSlots || []);
      setActiveTab('slots');
    } catch { alert("Failed to fetch free slots."); }
    finally { setLoadingSlots(false); }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
      setActiveTab('tasks');
    } catch { alert("Failed to fetch tasks."); }
    finally { setLoadingTasks(false); }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
      setActiveTab('analytics');
    } catch { alert("Failed to fetch analytics."); }
    finally { setLoadingAnalytics(false); }
  };

  const fetchReminder = async () => {
    if (events.length === 0) return alert("Please load calendar first!");
    setLoadingReminder(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      const data = await res.json();
      setReminder(data.reminder || data.message);
    } catch { alert("Failed to get reminder."); }
    finally { setLoadingReminder(false); }
  };

  const generateStudyPlan = async () => {
    if (!studySubject) return alert("Please enter a subject!");
    setLoadingStudyPlan(true);
    try {
      const res = await fetch('/api/studyplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: studySubject, hoursNeeded: studyHours }),
      });
      const data = await res.json();
      setStudyPlan(data.plan || data.error);
      setActiveTab('study');
    } catch { alert("Failed to generate study plan."); }
    finally { setLoadingStudyPlan(false); }
  };

  const askAI = async () => {
    if (!input) return;
    setIsAiThinking(true);
    setChatResponse("");
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ content: input }],
          calendarData: events,
          conflicts,
          freeSlots,
          tasks,
        }),
      });
      const data = await res.json();
      setChatResponse(data.text || data.error);
    } catch { setChatResponse("Sorry, I couldn't process that request."); }
    finally { setIsAiThinking(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-5xl w-full">

        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-10 text-center">
          Smart Timetable Assistant
        </h1>

        {!session ? (
          <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 text-center">
            <p className="text-slate-400 mb-6 text-lg">Sign in with Google to manage your schedule</p>
            <button onClick={() => signIn('google')} className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Header */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-emerald-500/30">
              <p className="text-emerald-400 font-bold mb-4 text-center">Connected: {session.user?.email}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={fetchCalendar} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingEvents ? "Syncing..." : "🔄 Calendar"}
                </button>
                <button onClick={fetchConflicts} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingConflicts ? "Checking..." : "⚡ Conflicts"}
                </button>
                <button onClick={fetchFreeSlots} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingSlots ? "Finding..." : "🕐 Free Slots"}
                </button>
                <button onClick={fetchTasks} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingTasks ? "Loading..." : "✅ Tasks"}
                </button>
                <button onClick={fetchAnalytics} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingAnalytics ? "Loading..." : "📊 Analytics"}
                </button>
                <button onClick={() => setShowCalendarView(!showCalendarView)} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {showCalendarView ? "📋 List View" : "📆 Calendar View"}
                </button>
                <button onClick={fetchReminder} className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingReminder ? "Loading..." : "🔔 Reminder"}
                </button>
                <button onClick={() => signOut()} className="border border-slate-600 hover:border-slate-400 px-4 py-2 rounded-xl transition-colors text-sm">
                  Sign Out
                </button>
              </div>
            </div>

            {/* FullCalendar View */}
            {showCalendarView && (
              <FullCalendarView events={events} conflicts={conflicts} />
            )}

            {/* Reminder Box */}
            {reminder && (
              <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
                <p className="text-orange-400 font-bold mb-2">🔔 Your Reminder</p>
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{reminder}</p>
                <button onClick={() => setReminder("")} className="mt-2 text-xs text-slate-500 hover:text-slate-300">
                  Dismiss
                </button>
              </div>
            )}

            {/* Study Plan Generator */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-yellow-500/30">
              <h3 className="text-lg font-bold mb-3">🎓 Smart Study Plan Generator</h3>
              <div className="flex gap-2 flex-wrap">
                <input
                  className="flex-1 min-w-40 p-3 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-yellow-400 text-sm"
                  placeholder="Subject (e.g. Data Structures)"
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                />
                <input
                  className="w-24 p-3 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-yellow-400 text-sm"
                  placeholder="Hours"
                  type="number"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                />
                <button
                  onClick={generateStudyPlan}
                  disabled={loadingStudyPlan}
                  className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors text-sm"
                >
                  {loadingStudyPlan ? "Planning..." : "Generate Plan"}
                </button>
              </div>
            </div>

            {/* AI Chat */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500 shadow-lg shadow-blue-500/10">
              <h3 className="text-xl font-bold mb-4">🤖 Ask about your schedule</h3>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-400"
                  placeholder="e.g. When is my next free slot? Do I have conflicts?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAI()}
                />
                <button onClick={askAI} disabled={isAiThinking} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors">
                  {isAiThinking ? "Thinking..." : "Ask AI"}
                </button>
              </div>
              {chatResponse && (
                <div className="mt-4 p-4 bg-slate-900 rounded-lg text-left border-l-4 border-emerald-500">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">AI Assistant</p>
                  <p className="text-slate-200 whitespace-pre-wrap">{chatResponse}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 flex-wrap border-b border-slate-700 pb-2">
              {[
                { key: 'calendar', label: `📅 Events (${events.length})` },
                { key: 'conflicts', label: `⚡ Conflicts (${conflicts.length})` },
                { key: 'slots', label: `🕐 Slots (${freeSlots.length})` },
                { key: 'tasks', label: `✅ Tasks (${tasks.length})` },
                { key: 'analytics', label: `📊 Analytics` },
                { key: 'study', label: `🎓 Study Plan` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === tab.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Click "🔄 Calendar" to load your events.</p>
                ) : events.map((event: any) => (
                  <div key={event.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors">
                    <p className="font-bold text-blue-300">{event.summary}</p>
                    <p className="text-xs text-slate-500 mt-1">📅 {new Date(event.start?.dateTime || event.start?.date).toLocaleString()}</p>
                    {event.location && <p className="text-xs text-slate-500">📍 {event.location}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Conflicts Tab */}
            {activeTab === 'conflicts' && (
              <div className="space-y-3">
                {conflicts.length === 0 ? (
                  <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-400 font-bold text-lg">✅ No Conflicts Found!</p>
                    <p className="text-slate-400 text-sm mt-1">Your schedule looks clean.</p>
                  </div>
                ) : conflicts.map((c, i) => (
                  <div key={i} className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                    <p className="font-bold text-red-400">⚠️ Scheduling Conflict</p>
                    <p className="text-sm text-red-300 mt-1">{c.message}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <p className="text-xs text-slate-400">Event 1</p>
                        <p className="text-sm font-medium">{c.event1.title}</p>
                        <p className="text-xs text-slate-500">{new Date(c.event1.start).toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <p className="text-xs text-slate-400">Event 2</p>
                        <p className="text-sm font-medium">{c.event2.title}</p>
                        <p className="text-xs text-slate-500">{new Date(c.event2.start).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Free Slots Tab */}
            {activeTab === 'slots' && (
              <div className="space-y-3">
                {freeSlots.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Click "🕐 Free Slots" to find gaps in your schedule.</p>
                ) : freeSlots.map((slot, i) => (
                  <div key={i} className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                    <p className="font-bold text-green-400">🕐 {slot.label}</p>
                    <p className="text-sm text-slate-300 mt-1">From: {new Date(slot.start).toLocaleString()}</p>
                    <p className="text-sm text-slate-300">To: {new Date(slot.end).toLocaleString()}</p>
                    <p className="text-xs text-green-500 mt-1">{slot.durationMinutes} minutes available for study</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Click "✅ Tasks" to load your Google Tasks.</p>
                ) : tasks.map((task: any) => (
                  <div key={task.id} className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                    <p className="font-bold text-purple-300">📝 {task.title}</p>
                    {task.due && <p className="text-xs text-slate-400 mt-1">Due: {new Date(task.due).toLocaleDateString()}</p>}
                    {task.notes && <p className="text-xs text-slate-500 mt-1">{task.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {!analytics ? (
                  <p className="text-slate-500 text-center py-8">Click "📊 Analytics" to see your stats.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Total Events", value: analytics.totalEvents, color: "blue" },
                        { label: "Total Hours", value: analytics.totalHours + "h", color: "emerald" },
                        { label: "Avg/Day", value: analytics.avgEventsPerDay, color: "purple" },
                        { label: "Busiest Day", value: analytics.busiestDay, color: "yellow" },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 bg-slate-800 border border-${stat.color}-500/30 rounded-xl text-center`}>
                          <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                          <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                      <h4 className="font-bold mb-3 text-slate-300">📅 Events by Day of Week (Last 30 Days)</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.dayCount).map(([day, count]: any) => (
                          <div key={day} className="flex items-center gap-3">
                            <span className="text-slate-400 text-sm w-8">{day}</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-4">
                              <div className="bg-blue-500 h-4 rounded-full transition-all"
                                style={{ width: `${analytics.totalEvents ? (count / analytics.totalEvents) * 100 : 0}%` }} />
                            </div>
                            <span className="text-slate-300 text-sm w-4">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                      <p className="text-slate-300 text-sm">⏰ <span className="font-bold">Busiest Hour:</span> {analytics.busiestHour}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Study Plan Tab */}
            {activeTab === 'study' && (
              <div className="space-y-3">
                {!studyPlan ? (
                  <p className="text-slate-500 text-center py-8">Use the Study Plan Generator above to create your plan.</p>
                ) : (
                  <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-400 font-bold mb-3">🎓 Your Personalized Study Plan</p>
                    <p className="text-slate-200 whitespace-pre-wrap text-sm">{studyPlan}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}