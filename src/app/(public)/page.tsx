// SPEC: SPEC-PAGES > / — Homepage
// Marketing landing page for Botmakers.ai with lead capture form
import { LeadForm } from "@/components/shared/lead-form";
import {
  Code,
  Zap,
  Bot,
  ArrowRight,
  Layers,
  Rocket,
  Shield,
  Calendar,
} from "lucide-react";

export const metadata = {
  title: "Botmakers.ai — AI-Accelerated Software Development",
  description:
    "Custom software built faster with AI. Web apps, mobile apps, SaaS, automation — delivered by BotMakers Inc. from Katy, Texas.",
};

const SERVICES = [
  {
    icon: Code,
    title: "Custom Web Apps",
    description:
      "Full-stack web applications built with modern frameworks. From landing pages to complex SaaS platforms.",
  },
  {
    icon: Bot,
    title: "AI Integrations",
    description:
      "Embed AI into your business — chatbots, document analysis, workflow automation powered by LLMs.",
  },
  {
    icon: Zap,
    title: "Automation",
    description:
      "Streamline operations with custom automation. Connect your tools, eliminate manual work, save hours every week.",
  },
  {
    icon: Layers,
    title: "SaaS Products",
    description:
      "Turn your idea into a product. We build, launch, and iterate on SaaS applications from zero to revenue.",
  },
];

const STATS = [
  { value: "10x", label: "Faster Development" },
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24hr", label: "Response Time" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#033457] via-[#033457] to-[#0a4570]" />
        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-[#03FF00]/10 text-[#03FF00]">
                <div className="w-2 h-2 rounded-full bg-[#03FF00] animate-pulse" />
                AI-Accelerated Development
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-white">
                Build Software
                <br />
                <span className="text-[#03FF00]">Faster with AI</span>
              </h1>
              <p className="text-lg lg:text-xl leading-relaxed max-w-lg text-gray-300">
                We combine expert engineers with AI to deliver custom software at
                unprecedented speed. Web apps, mobile apps, SaaS, automation —
                built right, shipped fast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 transition-colors rounded-lg"
                >
                  Start Your Project
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors rounded-lg"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Demo
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-[#03FF00]/5 rounded-2xl blur-3xl" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    <span className="ml-2 text-xs">botmakers-project</span>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono leading-relaxed overflow-hidden">
                    <code>{`const project = await botmakers.build({
  type: "web-app",
  stack: ["Next.js", "AI", "Supabase"],
  timeline: "2 weeks",
  ai_accelerated: true,
});

// Result: shipped 10x faster
console.log(project.status);
// => "deployed" ✓`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457] mb-4">
              What We Build
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From idea to production — we handle the full stack so you can
              focus on your business.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="group bg-white border border-gray-100 rounded-xl p-8 hover:border-[#033457]/20 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-[#033457]/5 flex items-center justify-center mb-5 group-hover:bg-[#03FF00]/10 transition-colors">
                  <service.icon className="w-6 h-6 text-[#033457]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#033457]">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#033457]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#03FF00] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium tracking-wide text-gray-300 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, transparent process from first contact to deployment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                icon: Rocket,
                title: "Tell Us Your Idea",
                description:
                  "Fill out the form below with your project details. We'll review and get back to you within 24 hours.",
              },
              {
                step: "02",
                icon: Zap,
                title: "We Build It Fast",
                description:
                  "Our AI-accelerated process means your project ships in days or weeks — not months.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Launch & Support",
                description:
                  "We deploy to production and provide ongoing support. Your project, our commitment.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#033457] mx-auto mb-6 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-[#03FF00]" />
                </div>
                <div className="text-xs font-bold text-[#03FF00] mb-2 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[#033457] mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457]">
                Ready to Build?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Tell us about your project and we&apos;ll get back to you within
                24 hours with a plan. No commitment, no pressure — just honest
                advice on how to bring your idea to life.
              </p>
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
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Book a Meeting — Google Calendar Appointment Scheduling */}
      <section id="book" className="py-24 bg-[#033457]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Book a Discovery Call
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Schedule a free 30-minute call to discuss your project.
            </p>
          </div>
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
        </div>
      </section>
    </>
  );
}
