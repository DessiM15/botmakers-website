import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-28 bg-gray-900 text-white">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div data-aos="fade-right">
            <span className="section-tagline bg-[#03FF00] text-[#033457]">
              Get In Touch
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mt-4 mb-4">
              Start Your{" "}
              <span className="text-[#03FF00]">AI Journey</span>
            </h2>
            <p className="text-lg font-light leading-relaxed text-white/60 max-w-xl">
              Ready to transform your business with custom AI solutions? Connect
              with our team of specialists to discover how Botmakers can
              streamline your operations.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center gap-6" data-aos="fade-left">
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 border border-white/20 rounded-lg flex items-center justify-center group-hover:border-[#03FF00] group-hover:bg-[#03FF00]/10 transition-all">
                <Phone className="w-5 h-5 text-[#03FF00]" />
              </div>
              <div>
                <div className="text-sm text-white/40 font-medium uppercase tracking-wider">Call Us</div>
                <a
                  href="tel:866-753-8002"
                  className="text-lg font-medium hover:text-[#03FF00] transition-colors"
                >
                  866-753-8002
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 border border-white/20 rounded-lg flex items-center justify-center group-hover:border-[#03FF00] group-hover:bg-[#03FF00]/10 transition-all">
                <Mail className="w-5 h-5 text-[#03FF00]" />
              </div>
              <div>
                <div className="text-sm text-white/40 font-medium uppercase tracking-wider">Email Us</div>
                <a
                  href="mailto:info@botmakers.ai"
                  className="text-lg font-medium hover:text-[#03FF00] transition-colors"
                >
                  info@botmakers.ai
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 border border-white/20 rounded-lg flex items-center justify-center group-hover:border-[#03FF00] group-hover:bg-[#03FF00]/10 transition-all">
                <MapPin className="w-5 h-5 text-[#03FF00]" />
              </div>
              <div>
                <div className="text-sm text-white/40 font-medium uppercase tracking-wider">Visit Us</div>
                <span className="text-lg font-medium">
                  24285 Katy Freeway, Suite 300, Katy, TX 77494
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Embed - Full Width */}
        <div data-aos="fade-up">
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
