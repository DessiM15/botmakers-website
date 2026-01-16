import {
  Code,
  Layers,
  Lightbulb,
  Database,
  Cpu,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const services = [
  {
    icon: Code,
    title: "Custom AI Software",
    description:
      "Bespoke AI applications built from the ground up to solve your specific business challenges and drive competitive advantage.",
  },
  {
    icon: Layers,
    title: "Systems Integration",
    description:
      "Seamlessly integrate AI capabilities into your existing enterprise systems, ERP, CRM, and legacy infrastructure.",
  },
  {
    icon: Lightbulb,
    title: "AI Strategy & Consulting",
    description:
      "Expert guidance to help you identify AI opportunities, plan adoption roadmaps, and maximize ROI on your AI investments.",
  },
  {
    icon: Database,
    title: "Data Engineering",
    description:
      "Build robust data pipelines and infrastructure that power your AI systems with clean, reliable, and scalable data.",
  },
  {
    icon: Cpu,
    title: "Machine Learning Solutions",
    description:
      "Custom ML models for prediction, classification, and optimization tailored to your industry and use cases.",
  },
  {
    icon: BarChart3,
    title: "AI Analytics & Insights",
    description:
      "Transform raw data into actionable intelligence with AI-powered dashboards, reporting, and decision support systems.",
  },
  {
    icon: Shield,
    title: "Enterprise Security AI",
    description:
      "AI-driven security solutions for threat detection, fraud prevention, and compliance monitoring.",
  },
  {
    icon: Zap,
    title: "Process Automation",
    description:
      "Intelligent automation that streamlines workflows, reduces manual tasks, and accelerates business operations.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Service Header */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6 text-[#033457]">
              Our
              <br />
              <span className="font-medium">Services</span>
            </h2>
            <p className="text-lg font-light leading-relaxed text-gray-600">
              End-to-end AI solutions for enterprises. From strategy to
              deployment, we build intelligent systems that transform your
              business.
            </p>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group p-8 border transition-colors cursor-pointer border-gray-100 hover:border-[#033457]/20"
                >
                  <div className="w-12 h-12 border flex items-center justify-center mb-6 group-hover:border-[#033457] group-hover:bg-[#033457] transition-colors border-gray-200">
                    <service.icon className="w-5 h-5 group-hover:text-[#03FF00] transition-colors text-gray-700" />
                  </div>
                  <h3 className="text-lg font-medium mb-3 text-[#033457]">
                    {service.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
