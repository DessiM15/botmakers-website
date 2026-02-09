import LeadForm from "./LeadForm";

export default function LeadFormSection() {
  return (
    <section id="project-form" className="py-28 bg-gray-900 text-white">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="text-center mb-12" data-aos="fade-up">
          <span className="section-tagline bg-[#03FF00] text-[#033457]">
            Start a Project
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mt-4 mb-4">
            Tell Us About Your{" "}
            <span className="text-[#03FF00]">Project</span>
          </h2>
          <p className="text-lg font-light leading-relaxed text-white/60 max-w-2xl mx-auto">
            Fill out the form below and our AI will generate a tailored project
            summary and recommended approach — delivered to your inbox in minutes.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
