'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function AdminDashboard() {
  const { user, dbUser, loading } = useAuth();

  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const [batchName, setBatchName] = useState("");
  const [batchDept, setBatchDept] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [creatingBatch, setCreatingBatch] = useState(false);

  const [studentEmail, setStudentEmail] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkBatchId, setBulkBatchId] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const [eventBatchId, setEventBatchId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState("class");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);

  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState("class");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const res = await fetch('/api/admin/batches');
      const data = await res.json();
      setBatches(data.batches || []);
    } catch {
      showMessage('Failed to load batches', 'error');
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      showMessage('Failed to load students', 'error');
    }
  };

  useEffect(() => {
    if (dbUser && (dbUser.role === 'FACULTY' || dbUser.role === 'ADMIN')) {
      fetchBatches();
      fetchStudents();
    }
  }, [dbUser]);

  const handleCreateBatch = async () => {
    if (!batchName || !batchDept || !batchYear) {
      return showMessage('Fill all batch fields', 'error');
    }
    setCreatingBatch(true);
    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: batchName,
          department: batchDept,
          year: batchYear,
          requesterEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`Batch "${batchName}" created!`, 'success');
        setBatchName(""); setBatchDept(""); setBatchYear("");
        fetchBatches();
      } else {
        showMessage(data.error || 'Failed to create batch', 'error');
      }
    } catch {
      showMessage('Network error creating batch', 'error');
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!studentEmail || !selectedBatchId) {
      return showMessage('Select a student and a batch', 'error');
    }
    setAssigning(true);
    try {
      const res = await fetch('/api/admin/assign-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail,
          batchId: selectedBatchId,
          requesterEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`${studentEmail} assigned to batch!`, 'success');
        setStudentEmail("");
        fetchBatches();
        fetchStudents();
      } else {
        showMessage(data.error || 'Failed to assign student', 'error');
      }
    } catch {
      showMessage('Network error assigning student', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkEmails.trim() || !bulkBatchId) {
      return showMessage('Paste emails and select a batch', 'error');
    }
    setBulkImporting(true);
    setBulkResult(null);
    try {
      const emails = bulkEmails
        .split(/[\n,;]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0);
      const res = await fetch('/api/admin/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          batchId: bulkBatchId,
          requesterEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkResult(data);
        showMessage(`Imported ${data.summary.total} students!`, 'success');
        setBulkEmails("");
        fetchBatches();
        fetchStudents();
      } else {
        showMessage(data.error || 'Bulk import failed', 'error');
      }
    } catch {
      showMessage('Network error during bulk import', 'error');
    } finally {
      setBulkImporting(false);
    }
  };

  const handleAddEvent = async () => {
    if (!eventBatchId || !eventTitle || !eventStart || !eventEnd) {
      return showMessage('Fill all required event fields', 'error');
    }
    setAddingEvent(true);
    try {
      const res = await fetch('/api/admin/batch-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          startTime: new Date(eventStart).toISOString(),
          endTime: new Date(eventEnd).toISOString(),
          type: eventType,
          batchId: eventBatchId,
          requesterEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const notified = data.notified || 0;
        showMessage(
          `Event "${eventTitle}" added! ${notified > 0 ? `📧 ${notified} student${notified !== 1 ? 's' : ''} notified.` : '(No students with email notifications enabled)'}`,
          'success'
        );
        setEventTitle(""); setEventDesc(""); setEventStart(""); setEventEnd("");
        fetchBatches();
      } else {
        showMessage(data.error || 'Failed to add event', 'error');
      }
    } catch {
      showMessage('Network error adding event', 'error');
    } finally {
      setAddingEvent(false);
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent || !editTitle || !editStart || !editEnd) {
      return showMessage('Fill all required fields', 'error');
    }
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/batch-events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: editingEvent.id,
          title: editTitle,
          description: editDesc,
          startTime: new Date(editStart).toISOString(),
          endTime: new Date(editEnd).toISOString(),
          type: editType,
          requesterEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Event updated!', 'success');
        setEditingEvent(null);
        fetchBatches();
      } else {
        showMessage(data.error || 'Failed to update event', 'error');
      }
    } catch {
      showMessage('Network error updating event', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setDeletingEventId(eventId);
    try {
      const res = await fetch('/api/admin/batch-events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          requesterEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Event deleted!', 'success');
        fetchBatches();
      } else {
        showMessage(data.error || 'Failed to delete event', 'error');
      }
    } catch {
      showMessage('Network error deleting event', 'error');
    } finally {
      setDeletingEventId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060A14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7A99' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#060A14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8EDF7', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>Please sign in first</p>
          <a href="/" style={{ color: '#6366F1', fontSize: 14 }}>Go to homepage →</a>
        </div>
      </div>
    );
  }

  if (!dbUser || (dbUser.role !== 'FACULTY' && dbUser.role !== 'ADMIN')) {
    return (
      <div style={{ minHeight: '100vh', background: '#060A14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8EDF7', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
          <p style={{ fontSize: 18, marginBottom: 8 }}>Access Restricted</p>
          <p style={{ fontSize: 13, color: '#6B7A99', marginBottom: 16 }}>
            This dashboard is only available to faculty and admin accounts. Your current role: {dbUser?.role || 'unknown'}.
          </p>
          <a href="/" style={{ color: '#6366F1', fontSize: 14 }}>Go to dashboard →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060A14', color: '#E8EDF7', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea { font-family: inherit; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600 }}>🛠 Admin Dashboard</h1>
          <p style={{ fontSize: 12, color: '#6B7A99', marginTop: 2 }}>
            Signed in as {user.email} · Role: {dbUser.role}
          </p>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#A5B4FC', textDecoration: 'none', background: 'rgba(99,102,241,0.1)', border: '0.5px solid rgba(99,102,241,0.25)', padding: '8px 16px', borderRadius: 8 }}>
          ← Back to Dashboard
        </a>
      </div>

      {/* Toast */}
      {message && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 50,
          background: message.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
          border: `0.5px solid ${message.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: message.type === 'success' ? '#6EE7B7' : '#F87171',
          padding: '10px 18px', borderRadius: 10, fontSize: 13,
        }}>
          {message.text}
        </div>
      )}

      <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>

        {/* Create Batch + Assign Student */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#8899BB', marginBottom: 14 }}>🏫 Create New Batch</div>
            <input value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="Batch name (e.g. MCA 2025-2027)" style={inputStyle} />
            <input value={batchDept} onChange={e => setBatchDept(e.target.value)} placeholder="Department (e.g. MCA)" style={inputStyle} />
            <input value={batchYear} onChange={e => setBatchYear(e.target.value)} placeholder="Year (e.g. 2025)" type="number" style={inputStyle} />
            <button onClick={handleCreateBatch} disabled={creatingBatch} style={primaryBtnStyle}>
              {creatingBatch ? 'Creating...' : '+ Create Batch'}
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#8899BB', marginBottom: 14 }}>👤 Assign Student to Batch</div>
            <select value={studentEmail} onChange={e => setStudentEmail(e.target.value)} style={inputStyle}>
              <option value="">Select student...</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.email}>
                  {s.name || s.email} {s.batch ? `— currently in ${s.batch.name}` : '(unassigned)'}
                </option>
              ))}
            </select>
            <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)} style={inputStyle}>
              <option value="">Select batch...</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name} ({b.department} {b.year})</option>
              ))}
            </select>
            <button onClick={handleAssignStudent} disabled={assigning} style={primaryBtnStyle}>
              {assigning ? 'Assigning...' : '+ Assign Student'}
            </button>
          </div>
        </div>

        {/* Bulk Student Import */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#6EE7B7', marginBottom: 6 }}>📋 Bulk Student Import</div>
          <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 14 }}>
            Paste a list of student emails — one per line, or comma/semicolon separated. Students who haven't signed up yet will be pre-registered automatically.
          </div>
          <select value={bulkBatchId} onChange={e => setBulkBatchId(e.target.value)} style={inputStyle}>
            <option value="">Select batch to assign all students to...</option>
            {batches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name} ({b.department} {b.year})</option>
            ))}
          </select>
          <textarea
            value={bulkEmails}
            onChange={e => setBulkEmails(e.target.value)}
            placeholder={`student1@email.com\nstudent2@email.com\nstudent3@email.com`}
            rows={6}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
          <button onClick={handleBulkImport} disabled={bulkImporting}
            style={{ ...primaryBtnStyle, background: 'rgba(52,211,153,0.15)', border: '0.5px solid rgba(52,211,153,0.3)', color: '#6EE7B7' }}>
            {bulkImporting ? 'Importing...' : '📋 Import All Students'}
          </button>
          {bulkResult && (
            <div style={{ marginTop: 14, background: 'rgba(52,211,153,0.06)', border: '0.5px solid rgba(52,211,153,0.15)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, color: '#6EE7B7', fontWeight: 500, marginBottom: 8 }}>Import Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Assigned', value: bulkResult.summary.assigned, color: '#34D399' },
                  { label: 'Pre-registered', value: bulkResult.summary.created, color: '#A5B4FC' },
                  { label: 'Failed', value: bulkResult.summary.failed, color: '#F87171' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#6B7A99', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {bulkResult.details.failed.length > 0 && (
                <div style={{ fontSize: 11, color: '#F87171' }}>Failed: {bulkResult.details.failed.join(', ')}</div>
              )}
            </div>
          )}
        </div>

        {/* Add Event */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#A5B4FC', marginBottom: 14 }}>📅 Push Event to Batch</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={eventBatchId} onChange={e => setEventBatchId(e.target.value)} style={inputStyle}>
              <option value="">Select batch...</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select value={eventType} onChange={e => setEventType(e.target.value)} style={inputStyle}>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="deadline">Deadline</option>
            </select>
            <input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event title" style={{ ...inputStyle, gridColumn: 'span 2' }} />
            <textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="Description (optional)" rows={2} style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' as const }} />
            <div>
              <label style={labelStyle}>Start Time</label>
              <input value={eventStart} onChange={e => setEventStart(e.target.value)} type="datetime-local" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input value={eventEnd} onChange={e => setEventEnd(e.target.value)} type="datetime-local" style={inputStyle} />
            </div>
          </div>
          <button onClick={handleAddEvent} disabled={addingEvent}
            style={{ ...primaryBtnStyle, marginTop: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
            {addingEvent ? 'Adding...' : '+ Push Event to Batch'}
          </button>
        </div>

        {/* Batches List */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#8899BB' }}>📋 All Batches</span>
            <button onClick={fetchBatches} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 12, cursor: 'pointer' }}>
              {loadingBatches ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
          {batches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#4A5568', fontSize: 13 }}>
              No batches yet — create one above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {batches.map((batch: any) => (
                <div key={batch.id} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#C5D0E8' }}>{batch.name}</div>
                      <div style={{ fontSize: 11, color: '#6B7A99', marginTop: 2 }}>{batch.department} · {batch.year}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.12)', color: '#A5B4FC' }}>
                        {batch.users?.length || 0} student{batch.users?.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }}>
                        {batch.events?.length || 0} event{batch.events?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {batch.users?.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 4 }}>STUDENTS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {batch.users.map((u: any) => (
                          <span key={u.id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', color: '#8899BB' }}>
                            {u.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {batch.events?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 4 }}>EVENTS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {batch.events.map((e: any) => (
                          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#8899BB', padding: '4px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                            <span>
                              <span style={{
                                color: e.type === 'exam' ? '#F87171' :
                                       e.type === 'holiday' ? '#34D399' :
                                       e.type === 'deadline' ? '#FCD34D' : '#A5B4FC'
                              }}>● {e.type}</span> — {e.title} ({new Date(e.startTime).toLocaleDateString()})
                            </span>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                              <button
                                onClick={() => {
                                  setEditingEvent(e);
                                  setEditTitle(e.title);
                                  setEditDesc(e.description || "");
                                  setEditType(e.type);
                                  setEditStart(new Date(e.startTime).toISOString().slice(0, 16));
                                  setEditEnd(new Date(e.endTime).toISOString().slice(0, 16));
                                }}
                                style={{ background: 'rgba(99,102,241,0.1)', border: '0.5px solid rgba(99,102,241,0.25)', color: '#A5B4FC', padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                disabled={deletingEventId === e.id}
                                style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', color: '#F87171', padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                                {deletingEventId === e.id ? '...' : '🗑 Delete'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0D1628', border: '0.5px solid rgba(99,102,241,0.3)', borderRadius: 14, padding: 28, width: 480, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#A5B4FC' }}>✏️ Edit Event</span>
              <button onClick={() => setEditingEvent(null)} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <select value={editType} onChange={e => setEditType(e.target.value)} style={inputStyle}>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="deadline">Deadline</option>
            </select>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Event title" style={inputStyle} />
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description (optional)" rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} />
            <label style={labelStyle}>Start Time</label>
            <input value={editStart} onChange={e => setEditStart(e.target.value)} type="datetime-local" style={inputStyle} />
            <label style={labelStyle}>End Time</label>
            <input value={editEnd} onChange={e => setEditEnd(e.target.value)} type="datetime-local" style={inputStyle} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setEditingEvent(null)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#6B7A99', padding: '10px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleEditEvent} disabled={savingEdit}
                style={{ flex: 2, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', color: 'white', padding: '10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  color: '#C5D0E8',
  outline: 'none',
  marginBottom: 10,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#6B7A99',
  marginBottom: 4,
  display: 'block',
};

const primaryBtnStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(99,102,241,0.15)',
  border: '0.5px solid rgba(99,102,241,0.3)',
  color: '#A5B4FC',
  padding: '10px',
  borderRadius: 8,
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 500,
};