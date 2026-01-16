import { Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-[#033457] text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left Column - Info */}
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight leading-tight">
              Start Your
              <br />
              <span className="font-medium">AI Journey</span>
            </h2>

            <p className="text-lg font-light leading-relaxed max-w-lg text-gray-300">
              Ready to transform your business communications? Connect with our
              team of AI specialists to discover how BotMakers can streamline
              your operations.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border flex items-center justify-center border-gray-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Call Us</div>
                  <a
                    href="tel:1-866-752-8002"
                    className="font-light hover:text-[#03FF00] transition-colors"
                  >
                    1-866-752-8002
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border flex items-center justify-center border-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Email Us</div>
                  <a
                    href="mailto:aicallers@botmakers.ai"
                    className="font-light hover:text-[#03FF00] transition-colors"
                  >
                    aicallers@botmakers.ai
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border flex items-center justify-center border-gray-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Visit Us</div>
                  <span className="font-light">
                    24285 Katy Freeway, Suite 300
                    <br />
                    Katy, TX 77494
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Cal.com Embed */}
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-sm overflow-hidden">
              <iframe
                src="https://cal.com/botmakers/30min?embed=true&layout=month_view"
                width="100%"
                height="550"
                title="Book a meeting with BotMakers"
                className="border-0"
                style={{ minHeight: "550px" }}
              />
            </div>
            <div className="text-center text-sm text-gray-400 mt-4">
              <p>No commitment required. Free consultation included.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
