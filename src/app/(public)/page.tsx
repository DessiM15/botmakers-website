// SPEC: SPEC-PAGES > / — Homepage
// Redesigned editorial homepage for publicly traded company
import { HeroSection } from "@/components/shared/hero-section";
import { ServicesSection } from "@/components/shared/services-section";
import { TrustedBySection } from "@/components/shared/trusted-by-section";
import { TestimonialCarousel } from "@/components/shared/testimonial-carousel";
import { LatestNewsSection } from "@/components/shared/latest-news-section";
import { QuickContactForm } from "@/components/shared/quick-contact-form";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";

export const metadata = {
  title: "Botmakers.ai — AI-Accelerated Software Development | BotMakers Inc. (OTC: BMAK)",
  description:
    "BotMakers Inc. is a publicly traded AI-accelerated software development company. Custom platforms, AI integrations, and automation — built to scale. Based in Katy, Texas.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TrustedBySection />
      <TestimonialCarousel />
      <LatestNewsSection />

      {/* Quick Contact Section */}
      <section className="py-28 lg:py-36 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <AnimateOnScroll>
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
                    Get in Touch
                  </p>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#033457] leading-tight">
                    Ready to build
                    <br />
                    something great?
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Tell us about your project and we&apos;ll get back to you
                  within 24 hours with a plan. No commitment, no pressure —
                  just honest advice on how to bring your idea to life.
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
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <QuickContactForm />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
