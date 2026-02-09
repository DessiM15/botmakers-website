"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 50, suffix: "+", label: "ENTERPRISE PROJECTS DELIVERED" },
  { value: 40, suffix: "%", label: "AVERAGE COST REDUCTION" },
  { value: 3, suffix: "x", label: "FASTER TIME TO MARKET" },
  { value: 99.9, suffix: "%", label: "SYSTEM UPTIME" },
];

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Number((progress * end).toFixed(end % 1 !== 0 ? 1 : 0)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);

  return count;
}

function StatItem({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 2000, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-aos="fade-up"
      data-aos-delay={delay.toString()}
      className="text-center p-8"
    >
      <div className="text-5xl lg:text-6xl font-bold mb-3 text-white">
        <span className="counter-value">{count}</span>
        <span className="text-[#03FF00]">{suffix}</span>
      </div>
      <div className="text-sm font-semibold tracking-wider text-white/70 uppercase">
        {label}
      </div>
    </div>
  );
}

export default function Statistics() {
  return (
    <section
      id="about"
      className="relative py-28"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1920&auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#033457]/90" />

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="section-tagline bg-[#03FF00] text-[#033457]">
            Our Impact
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mt-4 mb-6">
            Results That Speak
          </h2>
          <p className="text-lg font-light leading-relaxed text-white/60 max-w-2xl mx-auto">
            Our custom AI solutions deliver measurable impact for enterprises
            across every industry.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
            >
              <StatItem
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={index * 100}
              />
            </div>
          ))}
        </div>

        {/* BioQuest Info */}
        <div
          className="mt-16 p-8 lg:p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
          data-aos="fade-up"
        >
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-4 text-white">
              A Division of{" "}
              <span className="text-[#03FF00]">BioQuest, Inc.</span>
            </h3>
            <p className="text-white/60 font-light leading-relaxed">
              BotMakers, Inc. is a division of BioQuest, Inc. (publicly traded
              BQST), bringing enterprise-grade AI solutions backed by a
              publicly traded company&apos;s stability and resources.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
