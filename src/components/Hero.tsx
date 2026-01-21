import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-20">
      <div className="max-w-screen-2xl lg:p-12 mr-auto ml-auto pt-6 pr-6 pb-6 pl-6">
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-5rem)]">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-5 flex flex-col justify-start pt-0 lg:pt-0">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-light tracking-tight leading-none text-[#033457]">
                  Enterprise
                  <br />
                  <span className="font-medium">AI</span>
                  <br />
                  <span className="text-gray-400">Custom Built</span>
                </h1>

                <p className="text-lg lg:text-xl font-light leading-relaxed max-w-lg text-gray-600">
                  We build custom AI-powered software and systems that transform
                  how enterprises operate. From intelligent automation to
                  predictive analytics, we deliver solutions tailored to your
                  business.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="px-8 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-[#033457] hover:bg-[#022a45] text-white"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#industries"
                  className="border px-8 py-4 text-sm font-medium transition-colors border-gray-300 hover:border-[#033457] text-[#033457] text-center"
                >
                  View Industries
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Featured Image */}
          <div className="lg:col-span-7 flex items-start">
            <div className="w-full group cursor-pointer">
              <div className="relative h-80 lg:h-[500px] overflow-hidden bg-[#033457]">
                <img
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"
                  alt="Custom Software Development"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 group-hover:bg-[#033457]/10 transition-colors duration-300 bg-[#033457]/30"></div>
                <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 text-xs font-medium bg-[#03FF00] text-[#033457]">
                    CUSTOM AI SOLUTIONS
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-2xl font-light mb-1">
                    Built for Enterprise
                  </div>
                  <div className="text-sm opacity-90">
                    Scalable, secure, and intelligent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
