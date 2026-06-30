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
  const [productivityScore, setProductivityScore] = useState<any>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [useAgent, setUseAgent] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('calendar');
  const [batchEvents, setBatchEvents] = useState<any[]>([]);
  const [batchName, setBatchName] = useState<string | null>(null);
  const [loadingBatchEvents, setLoadingBatchEvents] = useState(false);

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

  useEffect(() => {
    if (user?.email) {
      fetchBatchEvents();
    }
  }, [user]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchCalendar = async () => {
    setLoadingEvents(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/calendar', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.error) alert("Error: " + JSON.stringify(data.error));
      else setEvents(data.items || []);
    } catch { alert("Failed to fetch calendar."); }
    finally { setLoadingEvents(false); }
  };

  const fetchBatchEvents = async () => {
    if (!user?.email) return;
    setLoadingBatchEvents(true);
    try {
      const res = await fetch(`/api/admin/batch-events?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setBatchEvents(data.events || []);
      setBatchName(data.batchName || null);
    } catch (err) {
      console.error("Failed to fetch batch events:", err);
    } finally {
      setLoadingBatchEvents(false);
    }
  };

  const fetchConflicts = async () => {
    setLoadingConflicts(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/conflicts', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setConflicts(data.conflicts || []);
      setActiveTab('conflicts');
      setActiveSidebarItem('conflicts');
    } catch { alert("Failed to fetch conflicts."); }
    finally { setLoadingConflicts(false); }
  };

  const fetchFreeSlots = async () => {
    setLoadingSlots(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/freeslots', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFreeSlots(data.freeSlots || []);
      setActiveTab('slots');
      setActiveSidebarItem('slots');
    } catch { alert("Failed to fetch free slots."); }
    finally { setLoadingSlots(false); }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTasks(data.tasks || []);
      setActiveTab('tasks');
      setActiveSidebarItem('tasks');
    } catch { alert("Failed to fetch tasks."); }
    finally { setLoadingTasks(false); }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const token = getToken();
      if (!token) return alert("Please sign in again!");
      const res = await fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAnalytics(data);
      setActiveTab('analytics');
      setActiveSidebarItem('analytics');
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
      setActiveSidebarItem('score');
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
      setActiveSidebarItem('study');
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
        body: JSON.stringify({ messages: newHistory, calendarData: events, conflicts, freeSlots, tasks }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.text || data.error }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that." }]);
    } finally { setIsAiThinking(false); }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return alert("Voice input not supported. Use Chrome!");
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const exportStudyPlan = () => {
    if (!studyPlan) return;
    const blob = new Blob([studyPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `study-plan-${studySubject}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportSchedule = () => {
    if (events.length === 0) return;
    const text = events.map((e: any) => `${e.summary} - ${new Date(e.start?.dateTime || e.start?.date).toLocaleString()}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-schedule.txt'; a.click();
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
      if (data.success) { setEmailSent(true); setTimeout(() => setEmailSent(false), 3000); }
      else alert("Failed: " + data.error);
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
      if (data.success) alert("✅ Weekly summary sent!");
      else alert("Failed: " + data.error);
    } catch { alert("Failed."); }
    finally { setSendingWeeklySummary(false); }
  };

  const saveStudyPlan = async () => {
    if (!studyPlan || !user) return;
    setSavingPlan(true);
    try {
      const res = await fetch('/api/saveplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.displayName, subject: studySubject, hours: studyHours, plan: studyPlan }),
      });
      const data = await res.json();
      if (data.success) { alert("✅ Saved!"); setSavedPlans(prev => [data.plan, ...prev]); }
    } catch { alert("Failed to save."); }
    finally { setSavingPlan(false); }
  };

  const nextEvent = events.find((e: any) => new Date(e.start?.dateTime || e.start?.date) > currentTime);

  const getCountdown = () => {
    if (!nextEvent) return null;
    const diff = new Date(nextEvent.start?.dateTime || nextEvent.start?.date).getTime() - currentTime.getTime();
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
  };

  const todayEvents = events.filter((e: any) => new Date(e.start?.dateTime || e.start?.date).toDateString() === new Date().toDateString());
  const weekEvents = events.filter((e: any) => { const d = new Date(e.start?.dateTime || e.start?.date); const now = new Date(); return d >= now && d <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); });

  const sidebarItems = [
    { id: 'calendar', icon: '📅', label: 'Calendar', action: () => { fetchCalendar(); setActiveSidebarItem('calendar'); setActiveTab('calendar'); } },
    { id: 'conflicts', icon: '⚡', label: 'Conflicts', action: fetchConflicts },
    { id: 'slots', icon: '🕐', label: 'Free Slots', action: fetchFreeSlots },
    { id: 'tasks', icon: '✅', label: 'Tasks', action: fetchTasks },
    { id: 'chat', icon: '🤖', label: 'AI Chat', action: () => setActiveSidebarItem('chat') },
    { id: 'study', icon: '🎓', label: 'Study Plan', action: () => { setActiveSidebarItem('study'); setActiveTab('study'); } },
    { id: 'predict', icon: '🔮', label: 'Predict', action: fetchPredictions },
    { id: 'analytics', icon: '📊', label: 'Analytics', action: fetchAnalytics },
    { id: 'score', icon: '🏆', label: 'Score', action: fetchProductivityScore },
    { id: 'email', icon: '📧', label: 'Email', action: () => setActiveSidebarItem('email') },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#6B7A99', fontSize: 14 }}>Loading Smart Timetable...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#060A14', color: '#E8EDF7', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          * { box-sizing: border-box; margin: 0; padding: 0; }
        `}</style>

        {/* Background orbs */}
        <div style={{ position: 'fixed', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'fixed', bottom: -150, left: -150, width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗓</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600 }}>Smart Timetable</div>
              <div style={{ fontSize: 11, color: '#4A5568' }}>Assistant</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '0.5px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#A5B4FC' }}>Track B Advanced</div>
            <div style={{ background: 'rgba(52,211,153,0.08)', border: '0.5px solid rgba(52,211,153,0.2)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#6EE7B7' }}>Live on Vercel</div>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 48px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.08)', border: '0.5px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#A5B4FC', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, background: '#6366F1', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            AI-Powered Academic Schedule Management
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 56, fontWeight: 700, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg, #E8EDF7 0%, #A5B4FC 50%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Manage Your Schedule<br />With Intelligence
          </h1>

          <p style={{ fontSize: 18, color: '#8899BB', lineHeight: 1.7, marginBottom: 40, maxWidth: 560 }}>
            Connect Google Calendar, detect conflicts, find free study slots, and get AI-powered scheduling assistance — all in one beautiful platform.
          </p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 64 }}>
            <button onClick={signIn} style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
              <span style={{ fontSize: 18 }}>G</span> Sign in with Google
            </button>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#C5D0E8', padding: '14px 28px', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>
              View Live Demo →
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, marginBottom: 64 }}>
            {[
              { num: '14+', label: 'API Endpoints' },
              { num: 'AI', label: 'LangChain Agent' },
              { num: '4', label: 'Google APIs' },
              { num: 'Live', label: 'Vercel Deploy' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: '#E8EDF7' }}>{s.num}</div>
                <div style={{ fontSize: 12, color: '#6B7A99', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Conflict Detection', desc: 'Auto-detect overlapping events and get smart resolution suggestions', color: '#6366F1' },
              { icon: '🤖', title: 'LangChain AI Agent', desc: 'Advanced AI agent powered by LLaMA 3.3 70B for scheduling assistance', color: '#34D399' },
              { icon: '📊', title: 'Smart Analytics', desc: '30-day productivity insights with Recharts visual dashboards', color: '#F59E0B' },
              { icon: '🎓', title: 'Study Planner', desc: 'AI-generated personalized study plans based on your free slots', color: '#EC4899' },
              { icon: '📧', title: 'Email Reminders', desc: 'Schedule reminders and weekly summaries via Gmail SMTP', color: '#8B5CF6' },
              { icon: '🏆', title: 'Productivity Score', desc: 'Get your productivity grade from A+ to F with detailed breakdown', color: '#06B6D4' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, cursor: 'default', transition: 'all 0.2s' }}>
                <div style={{ width: 40, height: 40, background: `${f.color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#C5D0E8', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Team */}
          <div style={{ marginTop: 64, padding: 32, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Built by Team</div>
              <div style={{ fontSize: 14, color: '#8899BB' }}>Ansh Bhatia • Abhinav Agarwal • Sujal Bhatia • Raj Shrivastava</div>
              <div style={{ fontSize: 12, color: '#4A5568', marginTop: 4 }}>MCA Program · Track B Advanced · 8-Week Project · 2026</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['A', 'Ab', 'S', 'R'].map((initial, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: ['#6366F1', '#34D399', '#8B5CF6', '#F59E0B'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'white', border: '2px solid #060A14', marginLeft: i > 0 ? -10 : 0 }}>{initial}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060A14', color: '#E8EDF7', fontFamily: "'DM Sans', sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#070B16', borderRight: '0.5px solid rgba(255,255,255,0.06)', padding: '20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        {/* Logo */}
        <div style={{ padding: '0 16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🗓</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600 }}>Smart Timetable</div>
              <div style={{ fontSize: 10, color: '#4A5568' }}>Academic Assistant</div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 9, color: '#3A4558', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 16px 6px' }}>Main</div>
          {sidebarItems.slice(0, 4).map(item => (
            <div key={item.id} onClick={item.action}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: activeSidebarItem === item.id ? '#A5B4FC' : '#6B7A99', cursor: 'pointer', background: activeSidebarItem === item.id ? 'rgba(99,102,241,0.08)' : 'transparent', borderRight: activeSidebarItem === item.id ? '2px solid #6366F1' : '2px solid transparent', transition: 'all 0.15s' }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}

          <div style={{ fontSize: 9, color: '#3A4558', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px 6px' }}>AI Tools</div>
          {sidebarItems.slice(4, 7).map(item => (
            <div key={item.id} onClick={item.action}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: activeSidebarItem === item.id ? '#A5B4FC' : '#6B7A99', cursor: 'pointer', background: activeSidebarItem === item.id ? 'rgba(99,102,241,0.08)' : 'transparent', borderRight: activeSidebarItem === item.id ? '2px solid #6366F1' : '2px solid transparent', transition: 'all 0.15s' }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}

          <div style={{ fontSize: 9, color: '#3A4558', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px 6px' }}>Insights</div>
          {sidebarItems.slice(7).map(item => (
            <div key={item.id} onClick={item.action}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: activeSidebarItem === item.id ? '#A5B4FC' : '#6B7A99', cursor: 'pointer', background: activeSidebarItem === item.id ? 'rgba(99,102,241,0.08)' : 'transparent', borderRight: activeSidebarItem === item.id ? '2px solid #6366F1' : '2px solid transparent', transition: 'all 0.15s' }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)' }} />
              : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>A</div>
            }
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#C5D0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || 'User'}</div>
              <div style={{ fontSize: 10, color: '#4A5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={() => signOut()} style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '7px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
              {getGreeting()}, {user.displayName?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#6B7A99' }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {todayEvents.length} events today
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportSchedule} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#8899BB', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
              📥 Export
            </button>
            <button onClick={() => setShowCalendarView(!showCalendarView)} style={{ background: 'rgba(99,102,241,0.1)', border: '0.5px solid rgba(99,102,241,0.25)', color: '#A5B4FC', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
              {showCalendarView ? '📋 List' : '📆 Calendar'}
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Events Loaded', value: events.length, sub: `${todayEvents.length} today`, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Conflicts', value: conflicts.length, sub: conflicts.length === 0 ? '✓ Clean' : '⚠ Check now', color: conflicts.length > 0 ? '#F87171' : '#34D399', bg: conflicts.length > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(52,211,153,0.08)' },
            { label: 'Tasks Due', value: tasks.length, sub: `${weekEvents.length} this week`, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Free Slots', value: freeSlots.length, sub: 'Available study time', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
          ].map((m, i) => (
            <div key={i} style={{ background: m.bg, border: `0.5px solid ${m.color}22`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 12, color: '#8899BB', marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#4A5568', marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Countdown */}
        {nextEvent && (
          <div style={{ background: 'rgba(6,182,212,0.06)', border: '0.5px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 20 }}>⏰</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next Event</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#C5D0E8' }}>{nextEvent.summary}</div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#06B6D4' }}>{getCountdown()}</div>
          </div>
        )}

        {/* Batch Schedule (Faculty-assigned events) */}
        {batchEvents.length > 0 && (
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '0.5px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#A5B4FC' }}>🏫 {batchName} — Batch Schedule</span>
              <span style={{ fontSize: 11, color: '#6B7A99' }}>{batchEvents.length} event{batchEvents.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {batchEvents.map((event: any) => {
                const typeColor =
                  event.type === 'exam' ? '#F87171' :
                  event.type === 'holiday' ? '#34D399' :
                  event.type === 'deadline' ? '#FCD34D' : '#6366F1';
                return (
                  <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#C5D0E8', fontWeight: 500 }}>{event.title}</div>
                      {event.description && <div style={{ fontSize: 11, color: '#8899BB', marginTop: 2 }}>{event.description}</div>}
                      <div style={{ fontSize: 11, color: '#4A5568', marginTop: 4 }}>
                        {new Date(event.startTime).toLocaleString()} — {new Date(event.endTime).toLocaleString()}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: `${typeColor}18`, color: typeColor, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {event.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No batch assigned message */}
        {batchEvents.length === 0 && !loadingBatchEvents && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, fontSize: 12, color: '#4A5568' }}>
            🏫 No batch assigned yet — your faculty hasn't added you to a class group.
          </div>
        )}

        {/* Calendar View */}
        {showCalendarView && (
          <div style={{ marginBottom: 20 }}>
            <FullCalendarView events={events} conflicts={conflicts} />
          </div>
        )}

        {/* Notifications */}
        {reminder && (
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '0.5px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#F59E0B' }}>🔔 Reminder</span>
              <button onClick={() => setReminder("")} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#8899BB', lineHeight: 1.6 }}>{reminder}</p>
          </div>
        )}

        {predictions && (
          <div style={{ background: 'rgba(236,72,153,0.06)', border: '0.5px solid rgba(236,72,153,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#EC4899' }}>🔮 Predictive Scheduling</span>
              <button onClick={() => setPredictions("")} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
            {patterns && (
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#6B7A99' }}>🔥 Busiest: {patterns.busiestDays?.join(', ')}</span>
                <span style={{ fontSize: 11, color: '#6B7A99' }}>😌 Quietest: {patterns.quietDays?.join(', ')}</span>
              </div>
            )}
            <p style={{ fontSize: 13, color: '#8899BB', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{predictions}</p>
          </div>
        )}

        {/* Productivity Score */}
        {productivityScore && (
          <div style={{ background: 'rgba(52,211,153,0.06)', border: '0.5px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#34D399' }}>🏆 Productivity Score</span>
              <button onClick={() => setProductivityScore(null)} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid #34D399`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: '#34D399' }}>{productivityScore.score}</span>
                <span style={{ fontSize: 12, color: '#34D399' }}>{productivityScore.grade}</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#C5D0E8' }}>{productivityScore.message}</p>
                <p style={{ fontSize: 12, color: '#6B7A99', marginTop: 4 }}>{productivityScore.totalEvents} events · {productivityScore.daysWithEvents} active days</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {productivityScore.breakdown?.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: '#8899BB', width: 160 }}>{item.label}</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${(item.score / item.max) * 100}%`, background: '#34D399', height: 6, borderRadius: 4 }}></div>
                  </div>
                  <span style={{ fontSize: 11, color: '#6B7A99', width: 40, textAlign: 'right' }}>{item.score}/{item.max}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Quick Actions */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#8899BB', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>⚡ Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '🔄', label: 'Load Calendar', action: fetchCalendar, loading: loadingEvents, color: '#6366F1' },
                { icon: '⚡', label: 'Check Conflicts', action: fetchConflicts, loading: loadingConflicts, color: '#EF4444' },
                { icon: '🕐', label: 'Free Slots', action: fetchFreeSlots, loading: loadingSlots, color: '#10B981' },
                { icon: '✅', label: 'Load Tasks', action: fetchTasks, loading: loadingTasks, color: '#8B5CF6' },
                { icon: '📊', label: 'Analytics', action: fetchAnalytics, loading: loadingAnalytics, color: '#F59E0B' },
                { icon: '🔔', label: 'Reminder', action: fetchReminder, loading: loadingReminder, color: '#F97316' },
                { icon: '🔮', label: 'Predict', action: fetchPredictions, loading: loadingPredictions, color: '#EC4899' },
                { icon: '🏆', label: 'Score', action: fetchProductivityScore, loading: loadingScore, color: '#34D399' },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.loading}
                  style={{ background: `${btn.color}10`, border: `0.5px solid ${btn.color}25`, color: btn.loading ? '#4A5568' : '#C5D0E8', padding: '10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{btn.loading ? '⟳' : btn.icon}</span>
                  {btn.loading ? 'Loading...' : btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#8899BB' }}>🤖 AI Assistant</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setUseAgent(!useAgent)}
                  style={{ background: useAgent ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${useAgent ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`, color: useAgent ? '#A78BFA' : '#6B7A99', padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>
                  {useAgent ? '🤖 Agent ON' : '💬 Standard'}
                </button>
                {chatHistory.length > 0 && (
                  <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 11 }}>Clear</button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, maxHeight: 200, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chatHistory.length === 0 && (
                <div style={{ fontSize: 12, color: '#4A5568', textAlign: 'center', padding: '20px 0' }}>
                  Ask me about your schedule...
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5, background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: msg.role === 'user' ? '#C5D0E8' : '#8899BB', border: `0.5px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                    {msg.role === 'assistant' && <div style={{ fontSize: 9, color: '#34D399', fontWeight: 600, marginBottom: 4 }}>{useAgent ? 'LANGCHAIN AGENT' : 'AI ASSISTANT'}</div>}
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1', animation: 'pulse 1.4s infinite', animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                  <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isAiThinking && askAI()}
                placeholder="Ask about your schedule..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C5D0E8', outline: 'none' }}
              />
              <button onClick={startVoiceInput} style={{ background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 14 }}>
                {isListening ? '🔴' : '🎤'}
              </button>
              <button onClick={askAI} disabled={isAiThinking} style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, cursor: 'pointer' }}>
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Email + Study Plan Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Email */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#8899BB', marginBottom: 14 }}>📧 Email Notifications</div>
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              type="email"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#C5D0E8', outline: 'none', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={sendEmail} disabled={sendingEmail} style={{ flex: 1, background: 'rgba(236,72,153,0.1)', border: '0.5px solid rgba(236,72,153,0.25)', color: '#F472B6', padding: '9px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                {sendingEmail ? 'Sending...' : emailSent ? '✅ Sent!' : '📧 Send Reminder'}
              </button>
              <button onClick={sendWeeklySummary} disabled={sendingWeeklySummary} style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '0.5px solid rgba(99,102,241,0.25)', color: '#A5B4FC', padding: '9px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                {sendingWeeklySummary ? 'Sending...' : '📊 Weekly'}
              </button>
            </div>
          </div>

          {/* Study Plan */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#8899BB', marginBottom: 14 }}>🎓 Study Plan Generator</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                value={studySubject}
                onChange={(e) => setStudySubject(e.target.value)}
                placeholder="Subject (e.g. Data Structures)"
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#C5D0E8', outline: 'none' }}
              />
              <input
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                type="number"
                placeholder="Hrs"
                style={{ width: 60, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 8px', fontSize: 12, color: '#C5D0E8', outline: 'none' }}
              />
            </div>
            <button onClick={generateStudyPlan} disabled={loadingStudyPlan} style={{ width: '100%', background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.08))', border: '0.5px solid rgba(245,158,11,0.3)', color: '#FCD34D', padding: '10px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
              {loadingStudyPlan ? 'Generating...' : '✨ Generate AI Study Plan'}
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>

          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.06)', overflow: 'auto' }}>
            {[
              { key: 'calendar', label: `📅 Events (${events.length})` },
              { key: 'conflicts', label: `⚡ Conflicts (${conflicts.length})` },
              { key: 'slots', label: `🕐 Slots (${freeSlots.length})` },
              { key: 'tasks', label: `✅ Tasks (${tasks.length})` },
              { key: 'analytics', label: '📊 Analytics' },
              { key: 'study', label: '🎓 Study Plan' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                style={{ padding: '12px 18px', fontSize: 12, color: activeTab === tab.key ? '#A5B4FC' : '#6B7A99', background: activeTab === tab.key ? 'rgba(99,102,241,0.08)' : 'transparent', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #6366F1' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }}>

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search events..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C5D0E8', outline: 'none', marginBottom: 14 }}
                />
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A5568', fontSize: 13 }}>
                    Click "🔄 Load Calendar" to sync your events
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {events.filter((e: any) => e.summary?.toLowerCase().includes(searchQuery.toLowerCase())).map((event: any) => (
                      <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: event.source === 'outlook' ? '#8B5CF6' : '#6366F1', flexShrink: 0 }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: '#C5D0E8', fontWeight: 500 }}>{event.summary}</div>
                          <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>📅 {new Date(event.start?.dateTime || event.start?.date).toLocaleString()}</div>
                          {event.location && <div style={{ fontSize: 11, color: '#4A5568' }}>📍 {event.location}</div>}
                        </div>
                        {event.source === 'outlook' && <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(139,92,246,0.15)', color: '#A78BFA', borderRadius: 4 }}>Outlook</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conflicts Tab */}
            {activeTab === 'conflicts' && (
              <div>
                {conflicts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 14, color: '#34D399', fontWeight: 500 }}>No Conflicts Found!</div>
                    <div style={{ fontSize: 12, color: '#4A5568', marginTop: 4 }}>Your schedule looks clean</div>
                  </div>
                ) : conflicts.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#F87171', marginBottom: 8 }}>⚠️ {c.message}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[c.event1, c.event2].map((ev, j) => (
                        <div key={j} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 4 }}>Event {j + 1}</div>
                          <div style={{ fontSize: 12, color: '#C5D0E8' }}>{ev.title}</div>
                          <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{new Date(ev.start).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && (
              <div>
                {freeSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A5568', fontSize: 13 }}>Click "🕐 Free Slots" to find study gaps</div>
                ) : freeSlots.map((slot, i) => (
                  <div key={i} style={{ background: 'rgba(52,211,153,0.06)', border: '0.5px solid rgba(52,211,153,0.15)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#34D399', marginBottom: 6 }}>🕐 {slot.label}</div>
                    <div style={{ fontSize: 12, color: '#8899BB' }}>From: {new Date(slot.start).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#8899BB' }}>To: {new Date(slot.end).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#34D399', marginTop: 4 }}>{slot.durationMinutes} minutes free for studying</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A5568', fontSize: 13 }}>Click "✅ Load Tasks" to see your Google Tasks</div>
                ) : tasks.map((task: any) => (
                  <div key={task.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'rgba(139,92,246,0.04)', border: '0.5px solid rgba(139,92,246,0.12)', borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid rgba(139,92,246,0.4)', flexShrink: 0, marginTop: 1 }}></div>
                    <div>
                      <div style={{ fontSize: 13, color: '#C5D0E8' }}>{task.title}</div>
                      {task.due && <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>Due: {new Date(task.due).toLocaleDateString()}</div>}
                      {task.notes && <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{task.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                {!analytics ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A5568', fontSize: 13 }}>Click "📊 Analytics" to load your stats</div>
                ) : (
                  <AnalyticsCharts analytics={analytics} isDark={true} />
                )}
              </div>
            )}

            {/* Study Plan Tab */}
            {activeTab === 'study' && (
              <div>
                {!studyPlan ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A5568', fontSize: 13 }}>Use the Study Plan Generator above to create your plan</div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#FCD34D' }}>🎓 {studySubject} — Study Plan</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={exportStudyPlan} style={{ background: 'rgba(245,158,11,0.1)', border: '0.5px solid rgba(245,158,11,0.25)', color: '#FCD34D', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>📄 Export</button>
                        <button onClick={saveStudyPlan} disabled={savingPlan} style={{ background: 'rgba(99,102,241,0.1)', border: '0.5px solid rgba(99,102,241,0.25)', color: '#A5B4FC', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                          {savingPlan ? 'Saving...' : '💾 Save'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#8899BB', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{studyPlan}</div>
                    {savedPlans.length > 0 && (
                      <div style={{ marginTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                        <button onClick={() => setShowSavedPlans(!showSavedPlans)} style={{ background: 'none', border: 'none', color: '#6B7A99', fontSize: 12, cursor: 'pointer' }}>
                          {showSavedPlans ? '▲' : '▼'} Saved Plans ({savedPlans.length})
                        </button>
                        {showSavedPlans && savedPlans.map((plan: any) => (
                          <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                            <div>
                              <span style={{ fontSize: 12, color: '#C5D0E8' }}>{plan.subject} — {plan.hours}h</span>
                              <span style={{ fontSize: 11, color: '#4A5568', marginLeft: 8 }}>{new Date(plan.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button onClick={() => { setStudyPlan(plan.plan); setStudySubject(plan.subject); }}
                              style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 11, cursor: 'pointer' }}>Load →</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 