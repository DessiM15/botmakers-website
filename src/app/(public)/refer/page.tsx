// SPEC: SPEC-PAGES > /refer — Referral Form
// Public referral page for submitting referrals
import { ReferralForm } from "@/components/shared/referral-form";
import { Users, Gift, Heart } from "lucide-react";

export const metadata = {
  title: "Refer Someone — Botmakers.ai",
  description:
    "Know someone who needs custom software? Refer them to Botmakers and help them build something great.",
};

export default function ReferPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#033457] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-[#03FF00]/10 text-[#03FF00] mb-6">
            <Gift className="w-3.5 h-3.5" />
            Referral Program
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Know Someone Who Needs
            <br />
            <span className="text-[#03FF00]">Custom Software?</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Help a friend, colleague, or business partner get the software they
            need. We&apos;ll reach out on your behalf with a personal
            introduction.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "We Handle the Outreach",
                description:
                  "We'll send a friendly intro email to your contact, mentioning you referred them.",
              },
              {
                icon: Heart,
                title: "They Get Great Service",
                description:
                  "Your referral gets the same AI-accelerated development experience our clients love.",
              },
              {
                icon: Gift,
                title: "You Get Our Gratitude",
                description:
                  "We appreciate every referral. If they become a client, we'll make sure to thank you.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-[#033457]/5 mx-auto mb-4 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#033457]" />
                </div>
                <h3 className="text-lg font-semibold text-[#033457] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Form */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6 lg:px-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <ReferralForm />
          </div>
        </div>
      </section>
    </>
  );
}
