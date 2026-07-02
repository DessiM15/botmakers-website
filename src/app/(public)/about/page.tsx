// SPEC: SPEC-PAGES > /about — Company about page
import Link from "next/link";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";
import { LEADERSHIP_TEAM, COMPANY_INFO } from "@/lib/utils/company-data";
import { ArrowRight, Target, Lightbulb, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "About — BotMakers Inc.",
  description:
    "Learn about BotMakers Inc., an AI-accelerated software development company based in Katy, Texas. Our mission, team, and values.",
};

const VALUES = [
  {
    icon: Zap,
    title: "Speed Without Compromise",
    description:
      "We leverage AI to deliver faster without cutting corners. Every project meets the same rigorous quality standards, regardless of timeline.",
  },
  {
    icon: Target,
    title: "Results-Driven",
    description:
      "We measure success by business outcomes, not lines of code. Every feature we build is tied to a concrete goal for your organization.",
  },
  {
    icon: Lightbulb,
    title: "Proactive Problem Solving",
    description:
      "We don't just build what you ask for — we identify gaps, anticipate problems, and answer questions you didn't know to ask.",
  },
  {
    icon: Shield,
    title: "Transparency & Trust",
    description:
      "Clear pricing, honest timelines, and open communication. No surprises, no hidden costs, no handoffs to junior teams.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
            About Us
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-tight">
            AI-Accelerated Software Development
          </h1>
          <p className="text-xl text-gray-300 mt-6 max-w-2xl">
            {COMPANY_INFO.description}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimateOnScroll>
              <div>
                <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
                  Our Mission
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457] leading-tight mb-6">
                  Making enterprise software accessible to everyone
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {COMPANY_INFO.mission}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "10x", label: "Faster Development" },
                  { value: "50+", label: "Projects Delivered" },
                  { value: "98%", label: "Client Satisfaction" },
                  { value: "24hr", label: "Response Time" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#033457]/5 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-[#033457] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="max-w-2xl mb-16">
              <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
                What We Do
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457]">
                Full-spectrum software development
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Custom Web & Mobile Applications",
                desc: "Full-stack applications built with Next.js, React, and modern cloud infrastructure. From MVPs to enterprise platforms.",
              },
              {
                title: "AI & Machine Learning Integration",
                desc: "Intelligent chatbots, document processing, data analysis, and AI-powered automation built on leading foundation models.",
              },
              {
                title: "Business Automation",
                desc: "Custom workflows, data pipelines, and process automation that connect your existing tools and eliminate manual work.",
              },
              {
                title: "SaaS Product Development",
                desc: "End-to-end product development from concept to revenue. Architecture, design, development, deployment, and iteration.",
              },
            ].map((service, i) => (
              <AnimateOnScroll key={service.title} delay={i * 100}>
                <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-md hover:border-[#033457]/10 transition-all">
                  <h3 className="text-lg font-semibold text-[#033457] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
                Our Values
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457]">
                How We Work
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <AnimateOnScroll key={value.title} delay={i * 100}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#033457] flex items-center justify-center mx-auto mb-5">
                    <value.icon className="w-7 h-7 text-[#03FF00]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#033457] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
                Leadership
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#033457]">
                Meet the Team
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {LEADERSHIP_TEAM.map((member, i) => (
              <AnimateOnScroll key={member.name} delay={i * 100}>
                <div className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-md hover:border-[#033457]/10 transition-all">
                  <div className="w-20 h-20 rounded-full bg-[#033457] flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#03FF00] font-bold text-2xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#033457]">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-[#03FF00] mt-0.5">
                    {member.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Location & CTA */}
      <section className="py-20 lg:py-28 bg-[#033457]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 text-center">
          <AnimateOnScroll>
            <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
              Based in Katy, Texas
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Build Something Great?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Whether you need a custom platform, AI integration, or business
              automation — we&apos;re here to help. Let&apos;s talk about your
              project.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#03FF00] text-[#033457] rounded-lg hover:bg-[#03FF00]/90 transition-colors font-semibold text-base"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
