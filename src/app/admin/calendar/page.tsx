// SPEC: Google Calendar Integration > Calendar Page
// DEP-MAP: Calendar > UI > CalendarPage
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requireTeam } from "@/lib/auth/helpers";
import { getEventsForDateRange, getConnectedTeamMembers } from "@/lib/db/queries/calendar";
import { CalendarView } from "@/components/admin/calendar-view";

export default async function CalendarPage() {
  await requireTeam();

  // Fetch events for current month ± 1 week buffer
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setDate(start.getDate() - 7);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setDate(end.getDate() + 7);

  const [events, connectedMembers] = await Promise.all([
    getEventsForDateRange(start, end),
    getConnectedTeamMembers(),
  ]);

  const googleConnected = connectedMembers.length > 0;

  if (!googleConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Calendar className="h-12 w-12 text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Connect Google Calendar
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Connect your Google Calendar in Settings to view your schedule,
          create events, and accept bookings.
        </p>
        <Button asChild className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
          <Link href="/admin/settings">Go to Settings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-[#03FF00]" />
        <h1 className="text-2xl font-bold">Calendar</h1>
      </div>
      <CalendarView events={events} googleConnected={googleConnected} />
    </div>
  );
}
