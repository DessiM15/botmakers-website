import Image from "next/image";

const clientLogos = [
  { name: "DM&A Attorneys at Law", src: "/assets/d-miller-logo.webp", width: 320, height: 120 },
  { name: "iHost Poker", src: "/assets/ihost-poker-logo.png", width: 140, height: 40 },
  { name: "Colonial Stock Transfer", src: "/assets/colonial-stock-logo.png", width: 180, height: 45 },
  { name: "3 Mark Financial", src: "/assets/3-mark-logo.png", width: 200, height: 50 },
];

function ClientLogo({ name, src, width, height }: { name: string; src: string; width: number; height: number }) {
  return (
    <div className="flex-shrink-0 mx-10 lg:mx-14 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
      <Image
        src={src}
        alt={name}
        width={width}
        height={height}
        className="object-contain max-h-[80px] w-auto"
      />
    </div>
  );
}

export default function TrustedBy() {
  // Duplicate logos for seamless infinite scroll
  const allLogos = [...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section className="py-16 bg-[#F8F6F7]">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <p
          style={{ color: "#033457" }}
          className="text-center text-sm font-semibold uppercase tracking-[0.2em] mb-10"
          data-aos="fade-up"
        >
          Trusted By
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative overflow-hidden" data-aos="fade-up" data-aos-delay="100">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F8F6F7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F8F6F7] to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex items-center animate-marquee">
          {allLogos.map((logo, i) => (
            <ClientLogo key={i} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
