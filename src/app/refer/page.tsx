import { Metadata } from "next";
import Navigation from "@/components/Navigation";
import ReferralForm from "@/components/ReferralForm";
import Footer from "@/components/Footer";
import AOSInit from "@/components/AOSInit";

export const metadata: Metadata = {
  title: "Refer a Contact | Botmakers.ai",
  description:
    "Know someone who could benefit from custom AI solutions? Refer them to Botmakers.ai and help us build the future of enterprise AI.",
};

export default function ReferPage() {
  return (
    <main>
      <AOSInit />
      <Navigation />
      <section className="pt-40 pb-28 bg-gray-900 text-white min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="section-tagline bg-[#03FF00] text-[#033457]">
              Referral Program
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mt-4 mb-4">
              Know Someone Who Could Benefit from{" "}
              <span className="text-[#03FF00]">Custom AI</span>?
            </h2>
            <p className="text-lg font-light leading-relaxed text-white/60 max-w-2xl mx-auto">
              Help us connect with businesses that could use enterprise AI
              solutions. Fill out the form below and we&apos;ll reach out with a
              personalized introduction.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ReferralForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
