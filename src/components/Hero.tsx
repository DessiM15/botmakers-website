"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#033457]/90" />

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 lg:px-8 w-full py-32 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-7">
            <div className="space-y-8">
              {/* Tagline */}
              <div
                className={`transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <span className="section-tagline bg-[#03FF00] text-[#033457]">
                  Enterprise AI Solutions
                </span>
              </div>

              {/* Main Heading */}
              <h1
                className={`text-4xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white transition-all duration-700 delay-200 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Custom Full-Stack
                <br />
                Software,{" "}
                <span className="text-[#03FF00]">AI</span>
                <br />
                Powered
              </h1>

              {/* Description */}
              <p
                className={`text-lg lg:text-xl font-light leading-relaxed max-w-xl text-white/70 transition-all duration-700 delay-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                We build custom AI-powered software and systems that transform
                how enterprises operate. From intelligent automation to
                predictive analytics, we deliver solutions tailored to your
                business.
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <a href="#project-form" className="btn-default btn-highlighted">
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#industries"
                  className="btn-default border border-white/30 text-white hover:border-[#03FF00] hover:text-[#03FF00]"
                >
                  <span>View Industries</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Image */}
          <div
            className={`lg:col-span-5 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className="relative">
              <div className="image-anime rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"
                  alt="Custom Software Development"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-2xl rounded-lg">
                <div className="text-3xl font-bold text-[#033457]">50+</div>
                <div className="text-sm text-gray-500 font-medium">
                  Enterprise Projects
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                <div className="text-sm font-bold text-[#033457]">
                  AI Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
