import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-20">
      <div className="max-w-screen-2xl lg:p-12 mr-auto ml-auto pt-6 pr-6 pb-6 pl-6">
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-5rem)]">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 w-fit text-gray-600 bg-gray-100">
                <div className="w-2 h-2 rounded-full bg-[#03FF00]"></div>
                The AI Agency
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-light tracking-tight leading-none text-[#033457]">
                  Smart
                  <br />
                  <span className="font-medium">Conversations</span>
                  <br />
                  <span className="text-gray-400">Seamless Connections</span>
                </h1>

                <p className="text-lg lg:text-xl font-light leading-relaxed max-w-lg text-gray-600">
                  AI-powered voice solutions that enable your business to save
                  time and money through automated customer interactions, lead
                  qualification, and operational streamlining.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="px-8 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-[#033457] hover:bg-[#022a45] text-white"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#services"
                  className="border px-8 py-4 text-sm font-medium transition-colors border-gray-300 hover:border-[#033457] text-[#033457] text-center"
                >
                  Explore Services
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Image Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 lg:gap-6 h-full">
              {/* Large Featured Image */}
              <div className="col-span-2 row-span-2 group cursor-pointer">
                <div className="relative h-80 lg:h-96 overflow-hidden bg-[#033457]">
                  <img
                    src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80"
                    alt="AI Voice Technology"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 group-hover:bg-[#033457]/10 transition-colors duration-300 bg-[#033457]/30"></div>
                  <div className="absolute top-6 left-6">
                    <span className="px-3 py-1 text-xs font-medium bg-[#03FF00] text-[#033457]">
                      AI VOICE AGENTS
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="text-2xl font-light mb-1">
                      24/7 Availability
                    </div>
                    <div className="text-sm opacity-90">
                      Never miss a customer call
                    </div>
                  </div>
                </div>
              </div>

              {/* Small Image Cards */}
              <div className="group cursor-pointer">
                <div className="relative h-32 lg:h-40 overflow-hidden bg-[#033457]">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80"
                    alt="Team Collaboration"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 group-hover:bg-[#033457]/20 transition-colors duration-300 bg-[#033457]/40"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-sm font-light">Voice2Form</div>
                    <div className="text-xs opacity-90">Real-time data capture</div>
                  </div>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="relative h-32 lg:h-40 overflow-hidden bg-[#033457]">
                  <img
                    src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80"
                    alt="AI Chatbot Interface"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 group-hover:bg-[#033457]/20 transition-colors duration-300 bg-[#033457]/40"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-sm font-light">AI Chatbots</div>
                    <div className="text-xs opacity-90">Intelligent responses</div>
                  </div>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="relative h-32 lg:h-40 overflow-hidden bg-[#033457]">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"
                    alt="Analytics Dashboard"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 group-hover:bg-[#033457]/20 transition-colors duration-300 bg-[#033457]/40"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-sm font-light">Lead Qualification</div>
                    <div className="text-xs opacity-90">Smart automation</div>
                  </div>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="relative h-32 lg:h-40 overflow-hidden bg-[#033457]">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
                    alt="Business Growth"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 group-hover:bg-[#033457]/20 transition-colors duration-300 bg-[#033457]/40"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-sm font-light">Ringless Voicemail</div>
                    <div className="text-xs opacity-90">Non-intrusive outreach</div>
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
