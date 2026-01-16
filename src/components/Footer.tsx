import { Linkedin, Twitter, Instagram } from "lucide-react";

const services = [
  { name: "Custom AI Software", href: "#services" },
  { name: "Systems Integration", href: "#services" },
  { name: "AI Consulting", href: "#services" },
  { name: "ML Solutions", href: "#services" },
];

const company = [
  { name: "About", href: "#about" },
  { name: "Industries", href: "#industries" },
  { name: "Contact", href: "#contact" },
  { name: "Client Portal", href: "https://clients.botmakers.ai" },
];

export default function Footer() {
  return (
    <footer className="py-16 bg-gray-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/assets/b light.png"
                alt="BotMakers"
                className="h-10 w-auto"
              />
              <span className="text-xl font-medium">BotMakers</span>
            </a>
            <p className="text-sm font-light leading-relaxed max-w-md mb-6 text-gray-400">
              The AI Agency: Enterprise AI, Custom Built.
              We build intelligent software and systems that transform
              how businesses operate.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 border flex items-center justify-center hover:border-[#03FF00] hover:text-[#03FF00] transition-colors cursor-pointer border-gray-700"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border flex items-center justify-center hover:border-[#03FF00] hover:text-[#03FF00] transition-colors cursor-pointer border-gray-700"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border flex items-center justify-center hover:border-[#03FF00] hover:text-[#03FF00] transition-colors cursor-pointer border-gray-700"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wide">SERVICES</h4>
            <div className="space-y-3 text-sm font-light text-gray-400">
              {services.map((service, index) => (
                <a
                  key={index}
                  href={service.href}
                  className="block transition-colors hover:text-[#03FF00]"
                >
                  {service.name}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wide">COMPANY</h4>
            <div className="space-y-3 text-sm font-light text-gray-400">
              {company.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block transition-colors hover:text-[#03FF00]"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-gray-500 border-gray-800">
          <p>
            © {new Date().getFullYear()} BotMakers, Inc. A Division of BioQuest,
            Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-gray-300">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-gray-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
