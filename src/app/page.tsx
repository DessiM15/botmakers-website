import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import Statistics from "@/components/Statistics";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AOSInit from "@/components/AOSInit";

export default function Home() {
  return (
    <main>
      <AOSInit />
      <Navigation />
      <Hero />
      <Industries />
      <Statistics />
      <Contact />
      <Footer />
    </main>
  );
}
