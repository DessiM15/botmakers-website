// SPEC: SPEC-PAGES > /admin/referrals — referrer cards with referred contacts
// DEP-MAP: Referrals > UI
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, Gift } from "lucide-react";
import { getReferrers } from "@/lib/db/queries/referrals";
import { PIPELINE_STAGE_LABELS } from "@/lib/types/constants";

export default async function ReferralsPage() {
  const referrers = await getReferrers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Referrals</h1>

      {referrers.length === 0 ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Gift className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-400">No referrals yet</p>
            <p className="text-sm text-gray-500">Share the referral page to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrers.map((referrer) => (
            <Card key={referrer.id} className="border-white/10 bg-white/5 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{referrer.fullName}</CardTitle>
                    <p className="text-sm text-gray-400">{referrer.email}</p>
                    {referrer.company && (
                      <p className="text-xs text-gray-500">{referrer.company}</p>
                    )}
                  </div>
                  <Badge className="bg-[#03FF00]/20 text-[#03FF00]">
                    {referrer.totalReferrals} referral{referrer.totalReferrals !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {referrer.feedback && (
                  <p className="text-sm text-gray-400 italic mt-2">&ldquo;{referrer.feedback}&rdquo;</p>
                )}
              </CardHeader>
              <CardContent>
                {referrer.referredLeads.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Referred Contacts</p>
                    {referrer.referredLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <div>
                          <p className="text-sm font-medium">{lead.fullName}</p>
                          <p className="text-xs text-gray-400">{lead.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/10 text-gray-300 text-xs">
                            {PIPELINE_STAGE_LABELS[lead.pipelineStage] ?? lead.pipelineStage}
                          </Badge>
                          <ArrowRight className="h-3 w-3 text-gray-500" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
