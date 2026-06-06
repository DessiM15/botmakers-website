// SPEC: Google Calendar Integration > Calendar UI
// DEP-MAP: Calendar > UI > CalendarView
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Video } from "lucide-react";
import type { CalendarEvent } from "@/lib/types/calendar";
import { EventDetailDialog } from "./event-detail-dialog";
import { CreateEventModal } from "./create-event-modal";

type ViewMode = "month" | "week" | "day";

const EVENT_COLORS: Record<string, string> = {
  discovery_call: "bg-[#03FF00]/20 text-[#03FF00] border-[#03FF00]/30",
  demo_booking: "bg-[#03FF00]/20 text-[#03FF00] border-[#03FF00]/30",
  client_meeting: "bg-[#033457]/60 text-white border-[#033457]",
  internal: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  follow_up: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  other: "bg-gray-400/20 text-gray-400 border-gray-400/30",
};

const DOT_COLORS: Record<string, string> = {
  discovery_call: "bg-[#03FF00]",
  demo_booking: "bg-[#03FF00]",
  client_meeting: "bg-[#033457]",
  internal: "bg-gray-500",
  follow_up: "bg-blue-500",
  other: "bg-gray-400",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarViewProps {
  events: CalendarEvent[];
  googleConnected: boolean;
}

export function CalendarView({ events, googleConnected }: CalendarViewProps) {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function navigate(dir: -1 | 1) {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const title = useMemo(() => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    }
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }, [currentDate, view]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">{title}</h2>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="text-white hover:bg-white/10">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="border-white/20 text-white hover:bg-white/10">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-sm rounded-md capitalize transition ${view === v ? "bg-[#03FF00] text-[#033457] font-medium" : "text-gray-400 hover:text-white"}`}>
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
            <Plus className="h-4 w-4 mr-1" />Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === "month" && <MonthView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} onDayClick={(d) => { setCurrentDate(d); setView("day"); }} />}
      {view === "week" && <WeekView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} />}
      {view === "day" && <DayView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} />}

      {/* Dialogs */}
      {selectedEvent && <EventDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showCreateModal && <CreateEventModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

function MonthView({ currentDate, events, onEventClick, onDayClick }: {
  currentDate: Date; events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void; onDayClick: (d: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEventsForDay(day: number) {
    return events.filter((e) => {
      const d = new Date(e.startTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <Card className="border-white/10 bg-white/5 overflow-hidden">
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div key={d} className="p-2 text-center text-xs font-medium text-gray-400 border-b border-white/10">{d}</div>
        ))}
        {cells.map((day, i) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          return (
            <div key={i} onClick={() => day && onDayClick(new Date(year, month, day))}
              className={`min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-white/5 cursor-pointer hover:bg-white/5 transition ${!day ? "bg-white/[0.02]" : ""}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium ${isToday(day) ? "bg-[#03FF00] text-[#033457] rounded-full w-6 h-6 inline-flex items-center justify-center" : "text-gray-300"}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button key={ev.id} onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                        className={`w-full text-left text-[10px] sm:text-xs px-1 py-0.5 rounded truncate border ${EVENT_COLORS[ev.eventType] ?? EVENT_COLORS.other}`}>
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function WeekView({ currentDate, events, onEventClick }: {
  currentDate: Date; events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM - 6 PM
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  function getEventsForDay(day: Date) {
    return events.filter((e) => {
      const d = new Date(e.startTime);
      return d.toDateString() === day.toDateString();
    });
  }

  return (
    <Card className="border-white/10 bg-white/5 overflow-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[700px]">
        <div className="border-b border-white/10" />
        {days.map((d) => (
          <div key={d.toISOString()} className={`p-2 text-center text-xs border-b border-white/10 ${d.toDateString() === today.toDateString() ? "text-[#03FF00] font-bold" : "text-gray-400"}`}>
            {d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
          </div>
        ))}
        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="p-1 text-[10px] text-gray-500 text-right pr-2 border-r border-white/5 h-16">
              {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "PM" : "AM"}
            </div>
            {days.map((day) => {
              const dayEvents = getEventsForDay(day).filter((e) => {
                const h = new Date(e.startTime).getHours();
                return h === hour;
              });
              return (
                <div key={day.toISOString() + hour} className="border-b border-r border-white/5 h-16 p-0.5 relative">
                  {dayEvents.map((ev) => (
                    <button key={ev.id} onClick={() => onEventClick(ev)}
                      className={`w-full text-left text-[10px] px-1 py-0.5 rounded truncate border ${EVENT_COLORS[ev.eventType] ?? EVENT_COLORS.other}`}>
                      {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}

function DayView({ currentDate, events, onEventClick }: {
  currentDate: Date; events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);
  const dayEvents = events.filter((e) => new Date(e.startTime).toDateString() === currentDate.toDateString());

  return (
    <Card className="border-white/10 bg-white/5">
      {hours.map((hour) => {
        const hourEvents = dayEvents.filter((e) => new Date(e.startTime).getHours() === hour);
        return (
          <div key={hour} className="flex border-b border-white/5 min-h-[64px]">
            <div className="w-16 p-2 text-xs text-gray-500 text-right pr-3 flex-shrink-0">
              {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
            </div>
            <div className="flex-1 p-1 space-y-1">
              {hourEvents.map((ev) => (
                <button key={ev.id} onClick={() => onEventClick(ev)}
                  className={`w-full text-left p-2 rounded border ${EVENT_COLORS[ev.eventType] ?? EVENT_COLORS.other}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{ev.title}</span>
                    {ev.meetingLink && <Video className="h-3.5 w-3.5 flex-shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs opacity-70 mt-0.5">
                    {new Date(ev.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} –{" "}
                    {new Date(ev.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {dayEvents.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">No events for this day</p>
      )}
    </Card>
  );
}
