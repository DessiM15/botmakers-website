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
          <div className="max-w-2xl">
            <h3 className="text-2xl font-light mb-4 text-[#033457]">
              A Division of <span className="font-medium">BioQuest, Inc.</span>
            </h3>
            <p className="text-gray-600 font-light leading-relaxed">
              BotMakers, Inc. is a division of BioQuest, Inc. (publicly traded
              BQST), bringing enterprise-grade AI solutions backed by a
              publicly traded company&apos;s stability and resources.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
