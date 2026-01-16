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
    <section id="industries" className="py-24 bg-[#033457]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6 text-white">
            Industries We{" "}
            <span className="font-medium">Serve</span>
          </h2>
          <p className="text-lg font-light leading-relaxed text-gray-300 max-w-2xl mx-auto">
            From Fortune 500 companies to local nonprofits, our AI solutions
            adapt to the unique needs of every sector.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="group p-6 bg-white/5 border border-white/10 hover:border-[#03FF00]/30 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-white/10 group-hover:bg-[#03FF00] transition-colors">
                <industry.icon className="w-5 h-5 text-white group-hover:text-[#033457] transition-colors" />
              </div>
              <h3 className="text-sm font-medium mb-2 text-white">
                {industry.title}
              </h3>
              <p className="text-xs font-light leading-relaxed text-gray-400">
                {industry.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
