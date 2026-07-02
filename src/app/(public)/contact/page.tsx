// SPEC: SPEC-PAGES > /contact — Contact page with lead form + booking
import { LeadForm } from "@/components/shared/lead-form";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";
import { Mail, MapPin, Globe, Calendar, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact Us — BotMakers Inc.",
  description:
    "Get in touch with BotMakers Inc. Start a project, book a discovery call, or ask us anything.",
};

export default function ContactPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
            Contact
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
            Let&apos;s Talk
          </h1>
          <p className="text-xl text-gray-300 mt-4 max-w-2xl">
            Tell us about your project and we&apos;ll get back to you within
            24 hours with a plan.
          </p>
        </div>
      </section>

      {/* Contact info + form */}
      <section className="py-16 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left — contact info */}
            <AnimateOnScroll>
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-bold text-[#033457] mb-6">
                    Contact Information
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#033457]/5 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#033457]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#033457]">Location</p>
                        <p className="text-sm text-gray-500">Katy, Texas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#033457]/5 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#033457]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#033457]">Email</p>
                        <a
                          href="mailto:info@botmakers.ai"
                          className="text-sm text-gray-500 hover:text-[#033457] transition-colors"
                        >
                          info@botmakers.ai
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#033457]/5 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-[#033457]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#033457]">Website</p>
                        <p className="text-sm text-gray-500">botmakers.ai</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Free project consultation",
                    "AI-powered delivery — 10x faster",
                    "Transparent pricing, no surprises",
                    "Ongoing support after launch",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#03FF00]/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#03FF00]" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Right — lead form */}
            <AnimateOnScroll delay={200}>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[#033457] mb-6">
                  Start a Project
                </h3>
                <LeadForm />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Booking calendar */}
      <section className="py-16 lg:py-24 bg-[#033457]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Book a Discovery Call
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Schedule a free 30-minute call to discuss your project.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2AgAOe0uv-WImpEWhZK6-hs6xWBxmhh62C1ZkGPeVMr7bGqZ5Mg0CESM5Spaq-zhY887D4Sxp_?gv=true"
                  style={{ border: 0, width: "100%", height: 600 }}
                  title="Book a Discovery Call"
                />
                <div className="bg-gray-50 px-6 py-4 text-center">
                  <a
                    href="https://calendar.app.google/XPMQJee7JkWaSnCe9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#033457] hover:text-[#03FF00] transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Open in Google Calendar
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
