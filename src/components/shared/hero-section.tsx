// SPEC: Homepage hero — full-viewport, animated gradient, editorial headline
"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimateOnScroll } from "./animate-on-scroll";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Navy background */}
      <div className="absolute inset-0 bg-[#033457]" />

      {/* Animated gradient mesh */}
      <div
        className="absolute inset-0 opacity-30 bm-gradient-shift"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(3, 255, 0, 0.15) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 80% 20%, rgba(30, 64, 175, 0.2) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 50% 80%, rgba(3, 255, 0, 0.1) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* SVG geometric patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-20 right-10 w-64 h-64 opacity-[0.04]"
          viewBox="0 0 200 200"
        >
          <polygon
            points="100,10 190,60 190,140 100,190 10,140 10,60"
            fill="none"
            stroke="#03FF00"
            strokeWidth="1"
          />
          <polygon
            points="100,30 170,70 170,130 100,170 30,130 30,70"
            fill="none"
            stroke="#03FF00"
            strokeWidth="0.5"
          />
        </svg>
        <svg
          className="absolute bottom-40 left-20 w-48 h-48 opacity-[0.03]"
          viewBox="0 0 200 200"
        >
          <line x1="0" y1="100" x2="200" y2="100" stroke="#03FF00" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="#03FF00" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#03FF00" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#03FF00" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#03FF00]/5 blur-[100px] bm-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-[80px] bm-float-delayed" />

      {/* Content */}
      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="max-w-3xl">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-[#03FF00]/10 text-[#03FF00] mb-8 border border-[#03FF00]/20">
              <div className="w-2 h-2 rounded-full bg-[#03FF00] animate-pulse" />
              Now Publicly Traded — OTC: BMAK
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white mb-8">
              Building the Future
              <br />
              <span className="text-[#03FF00]">with AI</span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <p className="text-xl lg:text-2xl leading-relaxed text-gray-300 mb-12 max-w-2xl">
              BotMakers Inc. combines expert engineers with artificial intelligence
              to deliver enterprise-grade software at unprecedented speed. Custom
              platforms, AI integrations, and automation — built to scale.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 transition-colors rounded-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium border border-white/20 text-white hover:bg-white/10 transition-colors rounded-lg"
              >
                Learn More
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/40" />
      </div>
    </section>
  );
}
