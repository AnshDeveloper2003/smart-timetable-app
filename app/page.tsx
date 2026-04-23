'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './lib/AuthContext';
import dynamic from 'next/dynamic';

const FullCalendarView = dynamic(() => import('./components/FullCalendarView'), { ssr: false });

export default function Home() {
  const { user, loading, signIn, signOut } = useAuth();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('googleAccessToken');
    }
    return null;
  };

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCalendar = async () => {
    setLoadingEvents(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) alert("Error: " + JSON.stringify(data.error));
      else setEvents(data.items || []);
    } catch { alert("Failed to fetch calendar."); }
    finally { setLoadingEvents(false); }
  };

  const fetchConflicts = async () => {
    setLoadingConflicts(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/conflicts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConflicts(data.conflicts || []);
      setActiveTab('conflicts');
    } catch { alert("Failed to fetch conflicts."); }
    finally { setLoadingConflicts(false); }
  };

  const fetchFreeSlots = async () => {
    setLoadingSlots(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/freeslots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFreeSlots(data.freeSlots || []);
      setActiveTab('slots');
    } catch { alert("Failed to fetch free slots."); }
    finally { setLoadingSlots(false); }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(data.tasks || []);
      setActiveTab('tasks');
    } catch { alert("Failed to fetch tasks."); }
    finally { setLoadingTasks(false); }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/studyplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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

  const exportStudyPlan = () => {
    if (!studyPlan) return alert("Generate a study plan first!");
    const blob = new Blob([studyPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-plan-${studySubject}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSchedule = () => {
    if (events.length === 0) return alert("Load calendar first!");
    const text = events.map((e: any) =>
      `${e.summary} - ${new Date(e.start?.dateTime || e.start?.date).toLocaleString()}`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-schedule.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const nextEvent = events.find((e: any) =>
    new Date(e.start?.dateTime || e.start?.date) > currentTime
  );

  const getCountdown = () => {
    if (!nextEvent) return null;
    const diff = new Date(nextEvent.start?.dateTime || nextEvent.start?.date).getTime() - currentTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
          <p className="text-slate-400 text-sm mt-1">Checking authentication...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex min-h-screen flex-col items-center ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'} p-6 sm:p-10 transition-colors duration-300`}>
      <div className="max-w-5xl w-full">

        {/* Title + Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Smart Timetable Assistant
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-200'} px-4 py-2 rounded-xl font-bold transition-colors text-sm border ${isDark ? 'border-slate-600' : 'border-gray-300'}`}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {!user ? (
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-10 rounded-3xl border text-center shadow-xl`}>
            <div className="text-7xl mb-6">🗓️</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Smart Timetable</h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} mb-8 text-lg`}>
              Sign in with Google to manage your schedule intelligently
            </p>
            <button
              onClick={signIn}
              className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg flex items-center gap-3 mx-auto text-lg"
            >
              <span className="text-blue-500 font-black text-xl">G</span>
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Connection Header */}
            <div className={`${isDark ? 'bg-slate-800 border-emerald-500/30' : 'bg-white border-emerald-300'} p-6 rounded-2xl border shadow`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {user.photoURL && (
                  <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-emerald-400" />
                )}
                <p className="text-emerald-400 font-bold text-lg">Connected: {user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
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
                <button onClick={exportSchedule} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  📥 Export Schedule
                </button>
                <button onClick={() => signOut()} className={`border ${isDark ? 'border-slate-600 hover:border-red-400 hover:text-red-400' : 'border-gray-300 hover:border-red-400 hover:text-red-500'} px-4 py-2 rounded-xl transition-colors text-sm`}>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats Badges */}
            {events.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    value: events.filter((e: any) => new Date(e.start?.dateTime || e.start?.date).toDateString() === new Date().toDateString()).length,
                    label: "Today's Events", color: "blue"
                  },
                  {
                    value: events.filter((e: any) => {
                      const d = new Date(e.start?.dateTime || e.start?.date);
                      const now = new Date();
                      return d >= now && d <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    }).length,
                    label: "This Week", color: "green"
                  },
                  { value: events.length, label: "Total Loaded", color: "purple" },
                  { value: conflicts.length, label: "Conflicts", color: "red" },
                ].map((stat, i) => (
                  <div key={i} className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-4 border border-${stat.color}-500/30 rounded-xl text-center shadow`}>
                    <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-1`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Countdown Timer */}
            {nextEvent && (
              <div className={`${isDark ? 'bg-slate-800 border-cyan-500/30' : 'bg-white border-cyan-300'} p-4 border rounded-xl text-center shadow`}>
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">⏰ Next Event Countdown</p>
                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{nextEvent.summary}</p>
                <p className="text-3xl font-mono font-bold text-cyan-400 mt-1">{getCountdown()}</p>
              </div>
            )}

            {/* FullCalendar View */}
            {showCalendarView && (
              <FullCalendarView events={events} conflicts={conflicts} />
            )}

            {/* Reminder Box */}
            {reminder && (
              <div className={`${isDark ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-300'} p-4 border rounded-xl`}>
                <p className="text-orange-400 font-bold mb-2">🔔 Your Reminder</p>
                <p className={`${isDark ? 'text-slate-200' : 'text-gray-700'} text-sm whitespace-pre-wrap`}>{reminder}</p>
                <button onClick={() => setReminder("")} className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* Study Plan Generator */}
            <div className={`${isDark ? 'bg-slate-800 border-yellow-500/30' : 'bg-white border-yellow-300'} p-6 rounded-2xl border shadow`}>
              <h3 className="text-lg font-bold mb-3">🎓 Smart Study Plan Generator</h3>
              <div className="flex gap-2 flex-wrap">
                <input
                  className={`flex-1 min-w-40 p-3 rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border focus:outline-none focus:border-yellow-400 text-sm`}
                  placeholder="Subject (e.g. Data Structures)"
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                />
                <input
                  className={`w-24 p-3 rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border focus:outline-none focus:border-yellow-400 text-sm`}
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
            <div className={`${isDark ? 'bg-slate-800 border-blue-500' : 'bg-white border-blue-400'} p-6 rounded-2xl border shadow-lg shadow-blue-500/10`}>
              <h3 className="text-xl font-bold mb-4">🤖 Ask about your schedule</h3>
              <div className="flex gap-2">
                <input
                  className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border focus:outline-none focus:border-blue-400`}
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
                <div className={`mt-4 p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'} rounded-lg text-left border-l-4 border-emerald-500`}>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">AI Assistant</p>
                  <p className={`${isDark ? 'text-slate-200' : 'text-gray-700'} whitespace-pre-wrap`}>{chatResponse}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 flex-wrap border-b ${isDark ? 'border-slate-700' : 'border-gray-300'} pb-2`}>
              {[
                { key: 'calendar', label: `📅 Events (${events.length})` },
                { key: 'conflicts', label: `⚡ Conflicts (${conflicts.length})` },
                { key: 'slots', label: `🕐 Slots (${freeSlots.length})` },
                { key: 'tasks', label: `✅ Tasks (${tasks.length})` },
                { key: 'analytics', label: `📊 Analytics` },
                { key: 'study', label: `🎓 Study Plan` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === tab.key
                    ? `${isDark ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900'}`
                    : `${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-3">
                <input
                  className={`w-full p-3 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:border-blue-400`}
                  placeholder="🔍 Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {events.length === 0 ? (
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>
                    Click "🔄 Calendar" to load your events.
                  </p>
                ) : events
                    .filter((e: any) => e.summary?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((event: any) => (
                      <div key={event.id} className={`p-4 ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-400'} border rounded-xl transition-colors`}>
                        <p className="font-bold text-blue-300">{event.summary}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'} mt-1`}>
                          📅 {new Date(event.start?.dateTime || event.start?.date).toLocaleString()}
                        </p>
                        {event.location && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>📍 {event.location}</p>}
                      </div>
                    ))}
              </div>
            )}

            {/* Conflicts Tab */}
            {activeTab === 'conflicts' && (
              <div className="space-y-3">
                {conflicts.length === 0 ? (
                  <div className={`p-6 ${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-300'} border rounded-xl text-center`}>
                    <p className="text-green-400 font-bold text-lg">✅ No Conflicts Found!</p>
                    <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm mt-1`}>Your schedule looks clean.</p>
                  </div>
                ) : conflicts.map((c, i) => (
                  <div key={i} className={`p-4 ${isDark ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-300'} border rounded-xl`}>
                    <p className="font-bold text-red-400">⚠️ Scheduling Conflict</p>
                    <p className="text-sm text-red-300 mt-1">{c.message}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className={`p-2 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Event 1</p>
                        <p className="text-sm font-medium">{c.event1.title}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(c.event1.start).toLocaleString()}</p>
                      </div>
                      <div className={`p-2 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Event 2</p>
                        <p className="text-sm font-medium">{c.event2.title}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(c.event2.start).toLocaleString()}</p>
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
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>
                    Click "🕐 Free Slots" to find gaps in your schedule.
                  </p>
                ) : freeSlots.map((slot, i) => (
                  <div key={i} className={`p-4 ${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-300'} border rounded-xl`}>
                    <p className="font-bold text-green-400">🕐 {slot.label}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'} mt-1`}>From: {new Date(slot.start).toLocaleString()}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>To: {new Date(slot.end).toLocaleString()}</p>
                    <p className="text-xs text-green-500 mt-1">{slot.durationMinutes} minutes available for study</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>
                    Click "✅ Tasks" to load your Google Tasks.
                  </p>
                ) : tasks.map((task: any) => (
                  <div key={task.id} className={`p-4 ${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-300'} border rounded-xl`}>
                    <p className="font-bold text-purple-300">📝 {task.title}</p>
                    {task.due && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-1`}>Due: {new Date(task.due).toLocaleDateString()}</p>}
                    {task.notes && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'} mt-1`}>{task.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {!analytics ? (
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>
                    Click "📊 Analytics" to see your stats.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Total Events", value: analytics.totalEvents, color: "blue" },
                        { label: "Total Hours", value: analytics.totalHours + "h", color: "emerald" },
                        { label: "Avg/Day", value: analytics.avgEventsPerDay, color: "purple" },
                        { label: "Busiest Day", value: analytics.busiestDay, color: "yellow" },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} border border-${stat.color}-500/30 rounded-xl text-center shadow`}>
                          <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-1`}>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl shadow`}>
                      <h4 className={`font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>📅 Events by Day of Week (Last 30 Days)</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.dayCount).map(([day, count]: any) => (
                          <div key={day} className="flex items-center gap-3">
                            <span className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm w-8`}>{day}</span>
                            <div className={`flex-1 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full h-4`}>
                              <div className="bg-blue-500 h-4 rounded-full transition-all"
                                style={{ width: `${analytics.totalEvents ? (count / analytics.totalEvents) * 100 : 0}%` }} />
                            </div>
                            <span className={`${isDark ? 'text-slate-300' : 'text-gray-600'} text-sm w-4`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl shadow`}>
                      <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'} text-sm`}>
                        ⏰ <span className="font-bold">Busiest Hour:</span> {analytics.busiestHour}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Study Plan Tab */}
            {activeTab === 'study' && (
              <div className="space-y-3">
                {!studyPlan ? (
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>
                    Use the Study Plan Generator above to create your plan.
                  </p>
                ) : (
                  <div className={`p-6 ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-300'} border rounded-xl`}>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-yellow-400 font-bold">🎓 Your Personalized Study Plan</p>
                      <button
                        onClick={exportStudyPlan}
                        className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        📄 Export
                      </button>
                    </div>
                    <p className={`${isDark ? 'text-slate-200' : 'text-gray-700'} whitespace-pre-wrap text-sm`}>{studyPlan}</p>
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