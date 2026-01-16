import {
  Phone,
  FileText,
  MessageSquare,
  Voicemail,
  Users,
  Clock,
  Mic,
  HelpCircle,
} from "lucide-react";

const services = [
  {
    icon: Phone,
    title: "AI Voice Agents",
    description:
      "Intelligent voice agents for inbound and outbound calling that handle customer interactions naturally and efficiently.",
  },
  {
    icon: FileText,
    title: "Voice2Form",
    description:
      "Revolutionary technology that captures form data in real-time through voice conversations, streamlining data entry.",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbots",
    description:
      "Smart chatbots that engage website visitors, qualify leads, and provide instant support around the clock.",
  },
  {
    icon: Voicemail,
    title: "Ringless Voicemail",
    description:
      "Non-intrusive voicemail campaigns that reach customers directly without disrupting their day.",
  },
  {
    icon: Users,
    title: "Lead Qualification",
    description:
      "Automated lead scoring and qualification that identifies your most promising prospects instantly.",
  },
  {
    icon: Clock,
    title: "24/7 Support Hotlines",
    description:
      "Always-on customer support that never sleeps, ensuring your customers get help whenever they need it.",
  },
  {
    icon: Mic,
    title: "AI Podcasting",
    description:
      "AI-powered podcast creation and production tools that help you create engaging audio content.",
  },
  {
    icon: HelpCircle,
    title: "Interactive Voice Help",
    description:
      "Voice-activated help systems that guide users through processes and answer questions naturally.",
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
              Comprehensive AI-powered solutions tailored to transform your
              business communications and operations.
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
