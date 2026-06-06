// SPEC: SPEC-PAGES > /admin/settings — 4-tab settings
// DEP-MAP: Settings > UI > SettingsTabs
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plug, Bell, Settings, Loader2, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  inviteTeamMember,
  toggleTeamMemberActive,
  updateSystemSetting,
} from "@/lib/actions/settings";
import { disconnectGoogleCalendar } from "@/lib/actions/calendar";

interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "member";
  isActive: boolean;
}

interface SettingsTabsProps {
  members: TeamMember[];
  settings: Record<string, unknown>;
  integrationStatus: {
    github: boolean;
    square: boolean;
    twilio: boolean;
    vercel: boolean;
    googleCalendar: boolean;
  };
  currentUserGoogleConnected: boolean;
  currentUserGoogleEmail: string | null;
}

const TABS = [
  { id: "team", label: "Team", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "defaults", label: "Defaults", icon: Settings },
];

export function SettingsTabs({
  members,
  settings,
  integrationStatus,
  currentUserGoogleConnected,
  currentUserGoogleEmail,
}: SettingsTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState("team");
  const [loading, setLoading] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  // Settings
  const [staleDays, setStaleDays] = useState(String(settings.stale_lead_days ?? 7));
  const [defaultTerms, setDefaultTerms] = useState(String(settings.default_terms ?? ""));

  async function handleInvite() {
    if (!inviteEmail || !inviteName) {
      toast.error("Email and name are required");
      return;
    }
    setLoading(true);
    try {
      const result = await inviteTeamMember({ email: inviteEmail, fullName: inviteName, role: inviteRole });
      if (result.success) {
        toast.success("Team member invited!");
        setInviteEmail("");
        setInviteName("");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Failed to invite");
      }
    } catch {
      toast.error("Failed to invite team member");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(memberId: string) {
    try {
      const result = await toggleTeamMemberActive(memberId);
      if (result.success) {
        toast.success("Member updated");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Failed to update");
      }
    } catch {
      toast.error("Failed to update member");
    }
  }

  async function handleSaveSetting(key: string, value: unknown) {
    setLoading(true);
    try {
      const result = await updateSystemSetting(key, value);
      if (result.success) {
        toast.success("Setting saved");
      } else {
        toast.error(result.error?.message ?? "Failed to save");
      }
    } catch {
      toast.error("Failed to save setting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t.id
                ? "bg-[#03FF00] text-[#033457]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Team tab */}
      {tab === "team" && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={loading} className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.fullName}</p>
                        <Badge className={member.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}>
                          {member.role}
                        </Badge>
                        {!member.isActive && (
                          <Badge className="bg-red-500/20 text-red-400">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                    <Button
                      onClick={() => handleToggleActive(member.id)}
                      size="sm"
                      variant="ghost"
                      className={member.isActive ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                    >
                      {member.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations tab */}
      {tab === "integrations" && (
        <div className="space-y-6">
          {/* Google Calendar — interactive connection */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Google Calendar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!integrationStatus.googleCalendar ? (
                <p className="text-sm text-gray-400">
                  Google Calendar credentials not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to your environment.
                </p>
              ) : currentUserGoogleConnected ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <span className="font-medium">Connected</span>
                      {currentUserGoogleEmail && (
                        <p className="text-sm text-gray-400">{currentUserGoogleEmail}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const result = await disconnectGoogleCalendar();
                        if (result.success) {
                          toast.success("Google Calendar disconnected");
                          router.refresh();
                        }
                      } catch {
                        toast.error("Failed to disconnect");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Not connected</span>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
                  >
                    <a href="/api/auth/google">Connect Google Calendar</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other integrations — env-based status */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Other Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                GitHub: integrationStatus.github,
                Square: integrationStatus.square,
                Twilio: integrationStatus.twilio,
                Vercel: integrationStatus.vercel,
              }).map(([name, connected]) => (
                <div key={name} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    {connected ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium">{name}</span>
                  </div>
                  <Badge className={connected ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-500"}>
                    {connected ? "Connected" : "Not configured"}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-gray-500 pt-2">
                Integration credentials are configured via environment variables.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-base">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stale Lead Threshold (days)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={staleDays}
                  onChange={(e) => setStaleDays(e.target.value)}
                  min={1}
                  max={90}
                  className="bg-white/5 border-white/10 text-white w-24"
                />
                <Button
                  onClick={() => handleSaveSetting("stale_lead_days", parseInt(staleDays) || 7)}
                  disabled={loading}
                  size="sm"
                  className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500">Leads without activity for this many days will trigger stale alerts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Defaults tab */}
      {tab === "defaults" && (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-base">Default Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Proposal Terms</Label>
              <Textarea
                value={defaultTerms}
                onChange={(e) => setDefaultTerms(e.target.value)}
                rows={8}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                placeholder="Enter default terms and conditions for proposals..."
              />
              <Button
                onClick={() => handleSaveSetting("default_terms", defaultTerms)}
                disabled={loading}
                size="sm"
                className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Save Terms
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
