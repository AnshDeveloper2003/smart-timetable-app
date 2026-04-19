'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Props {
  events: any[];
  conflicts: any[];
}

export default function FullCalendarView({ events, conflicts }: Props) {
  // Convert Google Calendar events to FullCalendar format
  const calendarEvents = events.map((event: any) => ({
    id: event.id,
    title: event.summary || 'Untitled',
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    textColor: '#FFFFFF',
  }));

  // Add conflicts in red
  const conflictEvents = conflicts.flatMap((c: any) => [
    {
      id: `conflict-1-${c.event1.title}`,
      title: `⚠️ ${c.event1.title}`,
      start: c.event1.start,
      end: c.event1.end,
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#FFFFFF',
    },
    {
      id: `conflict-2-${c.event2.title}`,
      title: `⚠️ ${c.event2.title}`,
      start: c.event2.start,
      end: c.event2.end,
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#FFFFFF',
    }
  ]);

  const allEvents = [...calendarEvents, ...conflictEvents];

  return (
    <div className="bg-white rounded-2xl p-4 text-black">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={allEvents}
        height="auto"
        eventClick={(info) => {
          alert(`Event: ${info.event.title}\nStart: ${info.event.start?.toLocaleString()}`);
        }}
        dayCellClassNames="cursor-pointer hover:bg-blue-50"
      />
    </div>
  );
}