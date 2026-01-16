const stats = [
  {
    value: "50+",
    label: "ENTERPRISE PROJECTS DELIVERED",
  },
  {
    value: "40%",
    label: "AVERAGE COST REDUCTION",
  },
  {
    value: "3x",
    label: "FASTER TIME TO MARKET",
  },
  {
    value: "99.9%",
    label: "SYSTEM UPTIME",
  },
];

export default function Statistics() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6 text-[#033457]">
            Results That{" "}
            <span className="font-medium">Speak</span>
          </h2>
          <p className="text-lg font-light leading-relaxed text-gray-600 max-w-2xl mx-auto">
            Our custom AI solutions deliver measurable impact for enterprises
            across every industry.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-light mb-2 text-[#033457]">
                {stat.value}
              </div>
              <div className="text-sm font-medium tracking-wide text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 p-8 lg:p-12 bg-gray-50 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-light mb-4 text-[#033457]">
                A Division of <span className="font-medium">BioQuest, Inc.</span>
              </h3>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                BotMakers, Inc. is a division of BioQuest, Inc. (publicly traded
                BQST), bringing enterprise-grade AI solutions backed by a
                publicly traded company&apos;s stability and resources.
              </p>
              <a
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#033457] hover:text-[#03FF00] transition-colors"
              >
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 bg-[#033457]/5 text-[#033457]">
                <div className="w-2 h-2 rounded-full bg-[#03FF00]"></div>
                BQST - Publicly Traded
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
