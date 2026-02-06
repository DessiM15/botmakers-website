import {
  Building2,
  Store,
  Heart,
  Landmark,
  GraduationCap,
  Trophy,
  Film,
  Vote,
  Shield,
  Scale,
  Church,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const industries = [
  {
    icon: Building2,
    title: "Corporations",
    description: "Enterprise-scale AI solutions for large organizations",
  },
  {
    icon: Store,
    title: "SMBs",
    description: "Affordable automation for growing businesses",
  },
  {
    icon: Heart,
    title: "Nonprofits",
    description: "Efficient donor engagement and outreach",
  },
  {
    icon: Landmark,
    title: "Government",
    description: "Streamlined citizen services and communication",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Enhanced student and parent engagement",
  },
  {
    icon: Trophy,
    title: "Athletics",
    description: "Fan engagement and ticket sales automation",
  },
  {
    icon: Film,
    title: "Entertainment",
    description: "Audience interaction and booking systems",
  },
  {
    icon: Vote,
    title: "Political Campaigns",
    description: "Voter outreach and constituent communication",
  },
  {
    icon: Shield,
    title: "Law Enforcement",
    description: "Community engagement and tip lines",
  },
  {
    icon: Scale,
    title: "Law Firms",
    description: "Client intake and case management",
  },
  {
    icon: Church,
    title: "Religious Organizations",
    description: "Member engagement and event coordination",
  },
  {
    icon: TrendingUp,
    title: "Public Companies",
    description: "Investor relations and capital raise support",
  },
];

export default function Industries() {
  return (
    <section id="industries" className="py-28 bg-[#F8F6F7]">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="section-tagline bg-[#033457]/10 text-[#033457]">
            Our Expertise
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#033457] mt-4 mb-6">
            Industries We Serve
          </h2>
          <p className="text-lg font-light leading-relaxed text-gray-500 max-w-2xl mx-auto">
            From Fortune 500 companies to local nonprofits, our AI solutions
            adapt to the unique needs of every sector.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={((index % 4) * 100).toString()}
              className="group p-6 lg:p-8 bg-white border border-gray-100 hover:border-[#03FF00]/50 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-lg"
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 bg-[#033457]/5 group-hover:bg-[#03FF00] transition-all duration-300">
                <industry.icon className="w-6 h-6 text-[#033457] group-hover:text-[#033457] transition-colors" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-[#033457]">
                {industry.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-gray-500">
                {industry.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12" data-aos="fade-up">
          <a href="#contact" className="btn-default btn-navy inline-flex">
            <span>Start Your Project</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
