// SPEC: Homepage trusted-by — client logo bar with grayscale hover effect
import Image from "next/image";
import { AnimateOnScroll } from "./animate-on-scroll";
import { CLIENT_LOGOS } from "@/lib/utils/company-data";

export function TrustedBySection() {
  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <AnimateOnScroll>
          <p className="text-center text-sm font-medium text-gray-400 tracking-widest uppercase mb-12">
            Trusted by Industry Leaders
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-16">
            {CLIENT_LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="relative h-10 w-28 lg:w-32 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
