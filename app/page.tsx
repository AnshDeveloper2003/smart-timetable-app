'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './lib/AuthContext';
import dynamic from 'next/dynamic';

const FullCalendarView = dynamic(() => import('./components/FullCalendarView'), { ssr: false });
const AnalyticsCharts = dynamic(() => import('./components/AnalyticsCharts'), { ssr: false });

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
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
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
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWeeklySummary, setSendingWeeklySummary] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [predictions, setPredictions] = useState("");
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [patterns, setPatterns] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  // Level 4 States
  const [productivityScore, setProductivityScore] = useState<any>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [useAgent, setUseAgent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/saveplan?email=${user.email}`)
        .then(res => res.json())
        .then(data => setSavedPlans(data.plans || []))
        .catch(() => {});
    }
  }, [user]);

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ events }),
      });
      const data = await res.json();
      setReminder(data.reminder || data.message);
    } catch { alert("Failed to get reminder."); }
    finally { setLoadingReminder(false); }
  };

  const fetchPredictions = async () => {
    setLoadingPredictions(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPredictions(data.predictions || data.error);
      setPatterns(data.patterns);
    } catch { alert("Failed to get predictions."); }
    finally { setLoadingPredictions(false); }
  };

  const fetchProductivityScore = async () => {
    setLoadingScore(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/productivity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProductivityScore(data);
    } catch { alert("Failed to get productivity score."); }
    finally { setLoadingScore(false); }
  };

  const generateStudyPlan = async () => {
    if (!studySubject) return alert("Please enter a subject!");
    setLoadingStudyPlan(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/studyplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: studySubject, hoursNeeded: studyHours }),
      });
      const data = await res.json();
      setStudyPlan(data.plan || data.error);
      setActiveTab('study');
    } catch { alert("Failed to generate study plan."); }
    finally { setLoadingStudyPlan(false); }
  };

  const askAI = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setInput("");
    setIsAiThinking(true);
    try {
      const endpoint = useAgent ? '/api/agent' : '/api/chat';
      const token = getToken();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useAgent && token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: newHistory,
          calendarData: events,
          conflicts,
          freeSlots,
          tasks,
        }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: data.text || data.error
      }]);
    } catch {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't process that."
      }]);
    } finally { setIsAiThinking(false); }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return alert("Voice input not supported. Use Chrome!");
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
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

  const sendEmail = async () => {
    if (!emailInput) return alert("Enter your email!");
    if (events.length === 0) return alert("Load calendar first!");
    setSendingEmail(true);
    try {
      const res = await fetch('/api/sendemail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailInput, events }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else alert("Failed: " + data.error);
    } catch { alert("Failed to send email."); }
    finally { setSendingEmail(false); }
  };

  const sendWeeklySummary = async () => {
    if (!emailInput) return alert("Enter your email first!");
    setSendingWeeklySummary(true);
    try {
      const res = await fetch('/api/weeklysummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailInput, events, analytics }),
      });
      const data = await res.json();
      if (data.success) alert("✅ Weekly summary sent to " + emailInput);
      else alert("Failed: " + data.error);
    } catch { alert("Failed to send weekly summary."); }
    finally { setSendingWeeklySummary(false); }
  };

  const saveStudyPlan = async () => {
    if (!studyPlan || !user) return;
    setSavingPlan(true);
    try {
      const res = await fetch('/api/saveplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          subject: studySubject,
          hours: studyHours,
          plan: studyPlan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Study plan saved!");
        setSavedPlans(prev => [data.plan, ...prev]);
      }
    } catch { alert("Failed to save plan."); }
    finally { setSavingPlan(false); }
  };

  const connectOutlook = async () => {
    try {
      const { loginWithOutlook, fetchOutlookEvents } = await import('./lib/outlook');
      const token = await loginWithOutlook();
      const outlookData = await fetchOutlookEvents(token);
      const formatted = outlookData.map((e: any) => ({
        id: e.id,
        summary: e.subject,
        start: { dateTime: e.start.dateTime },
        end: { dateTime: e.end.dateTime },
        source: 'outlook'
      }));
      setEvents(prev => [...prev, ...formatted]);
      alert(`✅ Added ${formatted.length} Outlook events!`);
    } catch {
      alert("Outlook sync coming soon!");
    }
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
        </div>
      </main>
    );
  }

  return (
    <main className={`flex min-h-screen flex-col items-center ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'} p-6 sm:p-10 transition-colors duration-300`}>
      <div className="max-w-5xl w-full">

        {/* Title */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Smart Timetable Assistant
          </h1>
          <button onClick={() => setIsDark(!isDark)}
            className={`${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-200'} px-4 py-2 rounded-xl font-bold transition-colors text-sm border ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {!user ? (
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-10 rounded-3xl border text-center shadow-xl`}>
            <div className="text-7xl mb-6">🗓️</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Smart Timetable</h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} mb-8 text-lg`}>Sign in with Google to manage your schedule</p>
            <button onClick={signIn} className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg flex items-center gap-3 mx-auto text-lg">
              <span className="text-blue-500 font-black text-xl">G</span>
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Header */}
            <div className={`${isDark ? 'bg-slate-800 border-emerald-500/30' : 'bg-white border-emerald-300'} p-6 rounded-2xl border shadow`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-emerald-400" />}
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
                <button onClick={fetchPredictions} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingPredictions ? "Analyzing..." : "🔮 Predict"}
                </button>
                <button onClick={fetchProductivityScore} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  {loadingScore ? "Calculating..." : "🏆 Score"}
                </button>
                <button onClick={exportSchedule} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  📥 Export
                </button>
                <button onClick={connectOutlook} className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  📧 Outlook
                </button>
                <button onClick={() => signOut()} className={`border ${isDark ? 'border-slate-600 hover:border-red-400 hover:text-red-400' : 'border-gray-300 hover:border-red-400 hover:text-red-500'} px-4 py-2 rounded-xl transition-colors text-sm`}>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats */}
            {events.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: events.filter((e: any) => new Date(e.start?.dateTime || e.start?.date).toDateString() === new Date().toDateString()).length, label: "Today's Events", color: "blue" },
                  { value: events.filter((e: any) => { const d = new Date(e.start?.dateTime || e.start?.date); const now = new Date(); return d >= now && d <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); }).length, label: "This Week", color: "green" },
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

            {/* Countdown */}
            {nextEvent && (
              <div className={`${isDark ? 'bg-slate-800 border-cyan-500/30' : 'bg-white border-cyan-300'} p-4 border rounded-xl text-center shadow`}>
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">⏰ Next Event Countdown</p>
                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{nextEvent.summary}</p>
                <p className="text-3xl font-mono font-bold text-cyan-400 mt-1">{getCountdown()}</p>
              </div>
            )}

            {/* FullCalendar */}
            {showCalendarView && <FullCalendarView events={events} conflicts={conflicts} />}

            {/* Reminder */}
            {reminder && (
              <div className={`${isDark ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-300'} p-4 border rounded-xl`}>
                <p className="text-orange-400 font-bold mb-2">🔔 Your Reminder</p>
                <p className={`${isDark ? 'text-slate-200' : 'text-gray-700'} text-sm whitespace-pre-wrap`}>{reminder}</p>
                <button onClick={() => setReminder("")} className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline">Dismiss</button>
              </div>
            )}

            {/* Predictions */}
            {predictions && (
              <div className={`${isDark ? 'bg-pink-900/20 border-pink-500/30' : 'bg-pink-50 border-pink-300'} p-5 border rounded-xl`}>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-pink-400 font-bold">🔮 Predictive Scheduling Recommendations</p>
                  <button onClick={() => setPredictions("")} className="text-xs text-slate-500 hover:text-slate-300 underline">Dismiss</button>
                </div>
                {patterns && (
                  <div className="flex gap-4 mb-3 flex-wrap">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>🔥 Busiest: {patterns.busiestDays?.join(', ')}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>😌 Quietest: {patterns.quietDays?.join(', ')}</span>
                  </div>
                )}
                <p className={`${isDark ? 'text-slate-200' : 'text-gray-700'} whitespace-pre-wrap text-sm`}>{predictions}</p>
              </div>
            )}

            {/* Productivity Score */}
            {productivityScore && (
              <div className={`${isDark ? 'bg-slate-800 border-emerald-500/30' : 'bg-white border-emerald-300'} p-6 border rounded-xl shadow`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">🏆 Productivity Score</h3>
                  <button onClick={() => setProductivityScore(null)} className="text-xs text-slate-500 hover:text-slate-300 underline">Dismiss</button>
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div className={`w-24 h-24 rounded-full border-4 border-${productivityScore.color}-400 flex flex-col items-center justify-center`}>
                    <p className={`text-3xl font-black text-${productivityScore.color}-400`}>{productivityScore.score}</p>
                    <p className={`text-sm font-bold text-${productivityScore.color}-400`}>{productivityScore.grade}</p>
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{productivityScore.message}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-1`}>
                      {productivityScore.totalEvents} events in 30 days •{' '}
                      {productivityScore.weeklyEvents} this week •{' '}
                      {productivityScore.daysWithEvents} active days
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {productivityScore.breakdown?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'} w-44`}>{item.label}</span>
                      <div className={`flex-1 ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full h-3`}>
                        <div className="bg-emerald-500 h-3 rounded-full transition-all"
                          style={{ width: `${(item.score / item.max) * 100}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-600'} w-12 text-right`}>
                        {item.score}/{item.max}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email */}
            <div className={`${isDark ? 'bg-slate-800 border-pink-500/30' : 'bg-white border-pink-300'} p-6 rounded-2xl border shadow`}>
              <h3 className="text-lg font-bold mb-3">📧 Email Notifications</h3>
              <div className="flex gap-2 flex-wrap">
                <input
                  className={`flex-1 min-w-40 p-3 rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border focus:outline-none focus:border-pink-400 text-sm`}
                  placeholder="Enter your email address"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button onClick={sendEmail} disabled={sendingEmail}
                  className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors text-sm">
                  {sendingEmail ? "Sending..." : emailSent ? "✅ Sent!" : "📧 Send Reminder"}
                </button>
                <button onClick={sendWeeklySummary} disabled={sendingWeeklySummary}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors text-sm">
                  {sendingWeeklySummary ? "Sending..." : "📊 Weekly Summary"}
                </button>
              </div>
              {emailSent && <p className="text-green-400 text-sm mt-2">✅ Reminder sent to {emailInput}!</p>}
            </div>

            {/* Study Plan */}
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
                  placeholder="Hours" type="number" value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                />
                <button onClick={generateStudyPlan} disabled={loadingStudyPlan}
                  className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors text-sm">
                  {loadingStudyPlan ? "Planning..." : "Generate Plan"}
                </button>
              </div>
              {savedPlans.length > 0 && (
                <div className="mt-3">
                  <button onClick={() => setShowSavedPlans(!showSavedPlans)}
                    className={`text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} underline`}>
                    {showSavedPlans ? "Hide" : "Show"} Saved Plans ({savedPlans.length})
                  </button>
                  {showSavedPlans && (
                    <div className="mt-2 space-y-2">
                      {savedPlans.map((plan: any) => (
                        <div key={plan.id} className={`p-3 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg`}>
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-sm">{plan.subject} — {plan.hours}h</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(plan.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => { setStudyPlan(plan.plan); setStudySubject(plan.subject); setActiveTab('study'); }}
                            className="text-xs text-blue-400 hover:text-blue-300 underline mt-1">
                            Load this plan
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Chat */}
            <div className={`${isDark ? 'bg-slate-800 border-blue-500' : 'bg-white border-blue-400'} p-6 rounded-2xl border shadow-lg shadow-blue-500/10`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold">🤖 Ask about your schedule</h3>
                {chatHistory.length > 0 && (
                  <button onClick={() => setChatHistory([])} className="text-xs text-slate-500 hover:text-red-400 underline">
                    Clear Chat
                  </button>
                )}
              </div>

              {/* Agent Mode Toggle */}
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setUseAgent(!useAgent)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    useAgent ? 'bg-violet-600 text-white' : `${isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-500'}`
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${useAgent ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                  {useAgent ? "LangChain Agent Active" : "Standard AI Mode"}
                </button>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  {useAgent ? "Using advanced LangChain agent" : "Click to enable agent"}
                </span>
              </div>

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className={`mb-4 max-h-80 overflow-y-auto space-y-3 p-3 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : `${isDark ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-700 border border-gray-200'} rounded-bl-none`
                      }`}>
                        {msg.role === 'assistant' && (
                          <p className="text-emerald-400 text-xs font-bold mb-1">
                            {useAgent ? "🤖 LangChain Agent" : "AI Assistant"}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="flex justify-start">
                      <div className={`p-3 rounded-xl rounded-bl-none ${isDark ? 'bg-slate-700' : 'bg-white border border-gray-200'}`}>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input
                  className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border focus:outline-none focus:border-blue-400`}
                  placeholder="e.g. When is my next free slot?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isAiThinking && askAI()}
                />
                <button onClick={startVoiceInput} disabled={isListening}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`}
                  title="Voice Input">
                  {isListening ? "🔴" : "🎤"}
                </button>
                <button onClick={askAI} disabled={isAiThinking}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors">
                  {isAiThinking ? "..." : "Send"}
                </button>
              </div>
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
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>Click "🔄 Calendar" to load your events.</p>
                ) : events.filter((e: any) => e.summary?.toLowerCase().includes(searchQuery.toLowerCase())).map((event: any) => (
                  <div key={event.id} className={`p-4 ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-400'} border rounded-xl transition-colors`}>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-blue-300">{event.summary}</p>
                      {event.source === 'outlook' && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Outlook</span>}
                    </div>
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
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>Click "🕐 Free Slots" to find gaps.</p>
                ) : freeSlots.map((slot, i) => (
                  <div key={i} className={`p-4 ${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-300'} border rounded-xl`}>
                    <p className="font-bold text-green-400">🕐 {slot.label}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'} mt-1`}>From: {new Date(slot.start).toLocaleString()}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>To: {new Date(slot.end).toLocaleString()}</p>
                    <p className="text-xs text-green-500 mt-1">{slot.durationMinutes} minutes available</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>Click "✅ Tasks" to load your Google Tasks.</p>
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
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>Click "📊 Analytics" to see your stats.</p>
                ) : (
                  <AnalyticsCharts analytics={analytics} isDark={isDark} />
                )}
              </div>
            )}

            {/* Study Plan Tab */}
            {activeTab === 'study' && (
              <div className="space-y-3">
                {!studyPlan ? (
                  <p className={`${isDark ? 'text-slate-500' : 'text-gray-400'} text-center py-8`}>Use the Study Plan Generator above.</p>
                ) : (
                  <div className={`p-6 ${isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-300'} border rounded-xl`}>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                      <p className="text-yellow-400 font-bold">🎓 Your Personalized Study Plan</p>
                      <div className="flex gap-2">
                        <button onClick={exportStudyPlan} className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg text-xs font-bold">📄 Export</button>
                        <button onClick={saveStudyPlan} disabled={savingPlan} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50">
                          {savingPlan ? "Saving..." : "💾 Save"}
                        </button>
                      </div>
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