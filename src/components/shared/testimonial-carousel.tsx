// SPEC: Homepage testimonial carousel — endorsement highlights
"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimateOnScroll } from "./animate-on-scroll";

const TESTIMONIALS = [
  {
    quote:
      "SmartViews does not merely present data — it is organizing and prioritizing information in a way that creates real business value and drives agent engagement.",
    author: "Betsy Riley",
    title: "3 Mark Financial, Inc.",
    context: "On the SmartViews & Doc2Video platforms",
  },
  {
    quote:
      "BotMakers designed and delivered our complete back office system from the ground up. They consistently deliver not just what we ask for, but what we actually need — identifying gaps, anticipating problems, and answering questions we did not know to ask.",
    author: "Bill Propper",
    title: "CEO, 3Mark Financial / Apex Affinity Group",
    context: "On BotMakers as exclusive AI partner",
  },
  {
    quote:
      "The solution gave us the ability to extract and structure our SmartOffice data in a way that is immediately actionable. What previously required significant manual effort now surfaces as clear, real-time intelligence across my agencies and individual agents.",
    author: "Philip Resch",
    title: "Founder & Principal, Valor Financial Specialists",
    context: "On the real-time intelligence platform",
  },
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section className="py-28 lg:py-36 bg-[#033457]">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <AnimateOnScroll>
          <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4 text-center">
            What Our Partners Say
          </p>
        </AnimateOnScroll>

        <div
          className="max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[280px] flex items-center">
            {TESTIMONIALS.map((testimonial, i) => (
              <div
                key={i}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 ${
                  i === activeIndex
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                {/* Decorative quote mark */}
                <div className="text-[#03FF00]/20 text-8xl font-serif leading-none mb-4">
                  &ldquo;
                </div>
                <blockquote className="text-xl lg:text-2xl text-white leading-relaxed mb-8 max-w-3xl font-light">
                  {testimonial.quote}
                </blockquote>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-400 text-sm">{testimonial.title}</p>
                  <p className="text-[#03FF00]/60 text-xs mt-1">
                    {testimonial.context}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-3 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-[#03FF00] w-6"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
