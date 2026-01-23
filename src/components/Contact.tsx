import { Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-gray-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Text Section - Above Calendar */}
        <div className="mb-12">
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-2">
            Start Your
          </h2>
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-6">
            AI Journey
          </h2>
          <p className="text-lg font-light leading-relaxed text-gray-300 max-w-xl mb-8">
            Ready to transform your business with custom AI solutions? Connect
            with our team of specialists to discover how Botmakers can
            streamline your operations.
          </p>

          {/* Contact Info - Horizontal Row */}
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border flex items-center justify-center border-gray-600 rounded">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Call Us</div>
                <a
                  href="tel:866-753-8002"
                  className="font-light hover:text-[#03FF00] transition-colors"
                >
                  866-753-8002
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border flex items-center justify-center border-gray-600 rounded">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Email Us</div>
                <a
                  href="mailto:info@botmakers.ai"
                  className="font-light hover:text-[#03FF00] transition-colors"
                >
                  info@botmakers.ai
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border flex items-center justify-center border-gray-600 rounded">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Visit Us</div>
                <span className="font-light">
                  24285 Katy Freeway, Suite 300, Katy, TX 77494
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Embed - Full Width */}
        <div>
          <iframe
            src="https://cal.com/botmakers/30min?embed=true&theme=dark&layout=month_view"
            width="100%"
            height="850"
            title="Book a meeting with BotMakers"
            className="border-0 rounded-lg"
            style={{ minHeight: "850px", colorScheme: "dark" }}
          />
        </div>
      </div>
    </section>
  );
}
