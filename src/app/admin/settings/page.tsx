// SPEC: SPEC-PAGES > /admin/settings — Team, Integrations, Notifications, Defaults
// DEP-MAP: Settings > UI
import { requireAdmin, requireTeam } from "@/lib/auth/helpers";
import { getTeamMembers, getAllSettings } from "@/lib/actions/settings";
import { env } from "@/lib/env";
import { isGoogleCalendarConfigured } from "@/lib/integrations/google-calendar";
import { SettingsTabs } from "@/components/admin/settings-tabs";

export default async function SettingsPage() {
  const user = await requireAdmin();

  const [members, settings] = await Promise.all([
    getTeamMembers(),
    getAllSettings(),
  ]);

  const integrationStatus = {
    github: !!env.GITHUB_TOKEN,
    square: !!(env.SQUARE_ACCESS_TOKEN && env.SQUARE_LOCATION_ID),
    twilio: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
    vercel: !!env.VERCEL_WEBHOOK_SECRET,
    googleCalendar: isGoogleCalendarConfigured(),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsTabs
        members={members}
        settings={settings}
        integrationStatus={integrationStatus}
        currentUserGoogleConnected={user.googleCalendarConnected}
        currentUserGoogleEmail={user.googleCalendarEmail}
      />
    </div>
  );
}
