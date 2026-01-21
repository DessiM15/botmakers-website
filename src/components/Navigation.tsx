"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full backdrop-blur-sm border-b z-50 bg-white/95 border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <a href="/">
            <img
              src="/assets/botmakers-full-logo.png"
              alt="Botmakers.ai"
              className="h-8 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-12">
            <a
              href="#industries"
              className="text-sm font-normal transition-colors text-gray-700 hover:text-[#033457]"
            >
              Industries
            </a>
            <a
              href="#about"
              className="text-sm font-normal transition-colors text-gray-700 hover:text-[#033457]"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-normal transition-colors text-gray-700 hover:text-[#033457]"
            >
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              className="px-6 py-2.5 text-sm font-medium transition-colors bg-[#033457] hover:bg-[#022a45] text-white"
            >
              Book a Demo
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[#033457]" />
            ) : (
              <Menu className="w-6 h-6 text-[#033457]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a
                href="#industries"
                className="text-sm font-normal py-2 text-gray-700 hover:text-[#033457]"
                onClick={() => setIsMenuOpen(false)}
              >
                Industries
              </a>
              <a
                href="#about"
                className="text-sm font-normal py-2 text-gray-700 hover:text-[#033457]"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="text-sm font-normal py-2 text-gray-700 hover:text-[#033457]"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <a
                href="#contact"
                className="mt-4 px-6 py-3 text-sm font-medium text-center transition-colors bg-[#033457] hover:bg-[#022a45] text-white"
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
