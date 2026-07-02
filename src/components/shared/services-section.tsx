// SPEC: Homepage services — editorial two-column style
import { Code, Bot, Zap, Layers } from "lucide-react";
import { AnimateOnScroll } from "./animate-on-scroll";

const SERVICES = [
  {
    icon: Code,
    title: "Custom Web Applications",
    description:
      "Full-stack web applications built with modern frameworks. From internal tools and dashboards to customer-facing SaaS platforms — architected for performance and scale.",
  },
  {
    icon: Bot,
    title: "AI Integrations",
    description:
      "Embed artificial intelligence into your business operations. Intelligent chatbots, document analysis, automated workflows, and decision-support systems powered by leading LLMs.",
  },
  {
    icon: Zap,
    title: "Automation & Workflows",
    description:
      "Eliminate manual processes with custom automation. Connect your existing tools, streamline operations, and free your team to focus on what matters most.",
  },
  {
    icon: Layers,
    title: "SaaS Products",
    description:
      "Transform your idea into a market-ready product. We design, build, and launch SaaS applications from concept to revenue — then iterate based on real user data.",
  },
];

export function ServicesSection() {
  return (
    <section className="py-28 lg:py-36 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <AnimateOnScroll>
          <div className="max-w-2xl mb-20">
            <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
              What We Build
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#033457] leading-tight">
              Enterprise software,
              <br />
              delivered at startup speed.
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {SERVICES.map((service, i) => (
            <AnimateOnScroll key={service.title} delay={i * 100}>
              <div className="group">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-lg bg-[#033457] flex items-center justify-center flex-shrink-0 group-hover:bg-[#03FF00] transition-colors duration-300">
                    <service.icon className="w-6 h-6 text-[#03FF00] group-hover:text-[#033457] transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#033457] mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
