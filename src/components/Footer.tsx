import { Linkedin, Twitter, Instagram, ArrowRight } from "lucide-react";

const company = [
  { name: "About", href: "#about" },
  { name: "Industries", href: "#industries" },
  { name: "Contact", href: "#contact" },
  { name: "Refer a Contact", href: "/refer" },
  { name: "Client Portal", href: "https://clients.botmakers.ai" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Footer Header */}
      <div className="border-b border-white/10">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <h3 className="text-2xl lg:text-3xl font-bold max-w-md">
              Start Your <span className="text-[#03FF00]">AI Journey</span>{" "}
              With Us
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/40 font-medium uppercase tracking-wider">
                Follow Us:
              </span>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center hover:border-[#03FF00] hover:bg-[#03FF00]/10 hover:text-[#03FF00] transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center hover:border-[#03FF00] hover:bg-[#03FF00]/10 hover:text-[#03FF00] transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center hover:border-[#03FF00] hover:bg-[#03FF00]/10 hover:text-[#03FF00] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-block mb-6">
              <img
                src="/assets/botmakers-white-green-logo.png"
                alt="Botmakers.ai"
                className="h-12 w-auto"
              />
            </a>
            <p className="text-base font-light leading-relaxed max-w-md mb-6 text-white/50">
              Enterprise AI, Custom Built. We build intelligent software and
              systems that transform how businesses operate.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase">
              Company
            </h4>
            <div className="space-y-4 text-sm font-light text-white/50">
              {company.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 transition-colors hover:text-[#03FF00] group"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#03FF00]" />
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Quick Info */}
          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider uppercase">
              Contact
            </h4>
            <div className="space-y-4 text-sm font-light text-white/50">
              <p>24285 Katy Freeway, Suite 300</p>
              <p>Katy, TX 77494</p>
              <a
                href="tel:866-753-8002"
                className="block hover:text-[#03FF00] transition-colors"
              >
                866-753-8002
              </a>
              <a
                href="mailto:info@botmakers.ai"
                className="block hover:text-[#03FF00] transition-colors"
              >
                info@botmakers.ai
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-white/30">
            <p>
              © {new Date().getFullYear()} BotMakers, Inc. A Division of
              BioQuest, Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="transition-colors hover:text-white/60">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-white/60">
                Terms of Service
              </a>
              <a href="https://botmakers-crm.vercel.app/sign-in" className="transition-colors hover:text-white/60">
                Team Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
