"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <a href="/" className="relative z-10">
            <img
              src="/assets/botmakers-full-logo.png"
              alt="Botmakers.ai"
              className={`h-12 w-auto transition-all duration-300 ${
                !isScrolled ? "brightness-0 invert" : ""
              }`}
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <a
              href="#industries"
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:text-[#033457]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Industries
            </a>
            <a
              href="#about"
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:text-[#033457]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              About
            </a>
            <a
              href="#contact"
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:text-[#033457]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              className="btn-default btn-highlighted"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 relative z-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? "text-[#033457]" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? "text-[#033457]" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-white/10 bg-white">
            <div className="flex flex-col gap-4">
              <a
                href="#industries"
                className="text-sm font-medium uppercase tracking-wider py-2 text-gray-700 hover:text-[#033457]"
                onClick={() => setIsMenuOpen(false)}
              >
                Industries
              </a>
              <a
                href="#about"
                className="text-sm font-medium uppercase tracking-wider py-2 text-gray-700 hover:text-[#033457]"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="text-sm font-medium uppercase tracking-wider py-2 text-gray-700 hover:text-[#033457]"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <a
                href="#contact"
                className="mt-4 btn-default btn-highlighted justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Book a Demo
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
