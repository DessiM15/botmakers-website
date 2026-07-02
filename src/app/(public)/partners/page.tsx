// SPEC: SPEC-PAGES > /partners — Endorsement letters showcase
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";

export const metadata = {
  title: "Partners — BotMakers Inc.",
  description:
    "Read endorsement letters from BotMakers' partners: 3 Mark Financial, Apex Affinity Group, and Valor Financial Specialists.",
};

const ENDORSEMENTS = [
  {
    author: "Betsy E. Riley",
    company: "3 Mark Financial, Inc.",
    date: "May 14, 2026",
    paragraphs: [
      "I am pleased to provide this letter of recommendation regarding Botmakers' SmartViews product and Doc2Video platform.",
      "I have been in the insurance industry for nearly 30 years and have extensive experience with insurance operations, reporting systems, agent management, commissions, and CRM technologies. In 2010, our company, 3 Mark Financial, transitioned from its legacy operating systems to Zinnia Smart Office. I personally led and implemented that transition process, including extensive testing to ensure that all agent data, policy data, and commission information migrated accurately and completely into the new platform.",
      "Since that time, I have used Smart Office daily to manage operational reporting and business intelligence for our organization. I currently utilize the system to generate and auto-send more than 100 reports each week to agents and affiliates throughout our network. Because of this hands-on experience, I believe I am uniquely qualified to evaluate products that integrate with and enhance the Smart Office ecosystem.",
      "After evaluating Botmakers' SmartViews platform, I can confidently say that it delivers significant and immediate value to both 3 Mark Financial and our downline agents. One of the biggest challenges we face operationally is that many agents and affiliates do not fully understand how to access or interpret the vast amount of data available within SmartView for Advisors. In reality, most rely almost entirely on the reports our office generates and distributes to them.",
      "Botmakers' SmartViews product solves this problem exceptionally well by perfectly encapsulating and simplifying the critical data housed within SmartView. The platform transforms complex reporting into actionable intelligence that agents can immediately understand and utilize. Features such as agent rankings, actionable follow-up items, policy summaries, pending business summaries, and consolidated agent data provide meaningful operational insight in a highly accessible format.",
      "What impressed me most is that SmartViews does not merely present data — it is organizing and prioritizing information in a way that creates real business value and drives agent engagement. The system gives agents a much clearer understanding of their business performance and areas requiring attention, which ultimately supports increased production and better operational management.",
      "I have also reviewed Botmakers' Doc2Video product and believe it provides substantial value as an innovative communication and client engagement tool. The Doc2Video platform creates dynamic videos for clients that help agents explain complex terms and concepts contained within insurance proposals and policies. This not only saves agents valuable time but also creates a far simpler and more effective understanding of the insurance policy for the client.",
      "In my opinion, Botmakers has developed practical, highly valuable tools that solve real-world operational and communication challenges within the insurance and financial services industries. Based on my experience, the SmartViews platform alone provides value well beyond its current cost of $149 per month and should generate meaningful business results for organizations that implement it effectively. Likewise, the Doc2Video product, at only $99 per month, is exceptionally well worth the investment given the time savings, enhanced client communication, and professional presentation it provides to agents and agencies.",
      "I would strongly recommend Botmakers' SmartViews and Doc2Video products to any organization seeking to improve operational visibility, agent engagement, reporting accessibility, client communication, and overall efficiency.",
    ],
  },
  {
    author: "Bill Propper",
    company: "CEO, 3Mark Financial / Apex Affinity Group",
    date: "March 24, 2026",
    paragraphs: [
      "I am writing to offer my strongest endorsement of BotMakers Inc. BotMakers has served as the exclusive AI automation partner for Apex Affinity Group, and the scope and quality of what they have delivered places them in a category of their own.",
      "BotMakers designed and delivered our complete back office system from the ground up — a fully web-based, mobile-ready platform spanning rep and admin portals, Zinnia integration, dynamic compensation tracking, and real-time organizational reporting. On top of that foundation, they built and deployed AI-powered training bots, an automated social media channel with AI-generated post creation and scheduling, and a suite of AI-driven podcasts and video content tools. The result is an enterprise-grade system that any of our representatives can access from any device, anywhere — built and delivered by a single, focused team.",
      "What distinguishes BotMakers is the depth of expertise. They consistently deliver not just what we ask for, but what we actually need — identifying gaps, anticipating problems, and answering questions we did not know to ask. When issues arise, their response time is measured in hours, not days. That level of responsiveness from an AI automation partner is rare, and it has made a material difference in how confidently we operate.",
      "BotMakers also serves as the AI and network marketing technology arm for Apex — managing the digital infrastructure that powers our representative network at scale.",
      "BotMakers is currently engaged with 3Mark Financial, the parent company of Apex Affinity Group, a large insurance marketing organization, leading a full technology modernization initiative to bring their systems to the same standard. Given what they have delivered for Apex, we have every confidence in the outcome.",
      "For any organization in the insurance, financial services, or network marketing space looking for an AI automation partner that thinks strategically and executes at the highest level, I recommend BotMakers Inc. without reservation.",
    ],
  },
  {
    author: "Philip Resch",
    company: "Founder & Principal, Valor Financial Specialists",
    date: "May 4, 2026",
    paragraphs: [
      "My name is Philip Resch, Founder and Principal of Valor Financial Specialists — an independent marketing organization based in Franklin, TN with over 650 agents and 35 sub-agencies operating nationwide.",
      "I have spent more than 20 years in the insurance distribution space, first as a wholesaler for MetLife and AIG/Corebridge, and for the past four-and-a-half years building my own independent brokerage. When I evaluated platforms to support a hierarchy-based distribution model, 3Mark Financial stood out as the only BGA capable of accommodating that structure — largely due to their partnership with SmartOffice.",
      "While SmartOffice provided a solid operational foundation, extracting meaningful, agent-level performance data was a persistent challenge. Generating usable reports required a level of technical effort that simply wasn't scalable for a growing organization. That friction eventually had me exploring alternative systems entirely.",
      "That changed when 3Mark connected me with Trent and the BotMakers AI platform. The solution gave us the ability to extract and structure our SmartOffice data in a way that is immediately actionable — without the complexity of building custom ad-hoc reports. What previously required significant manual effort now surfaces as clear, real-time intelligence across my agencies and individual agents.",
      "The impact has been direct: I can identify production trends, support my sub-agencies more proactively, and recruit with greater confidence knowing I have the data infrastructure to manage growth at scale.",
      "I am happy to speak with anyone at Zinnia who would like to learn more about my experience. This technology meaningfully extends the value of SmartOffice, and I believe it represents a compelling enhancement for any organization operating at scale within that ecosystem.",
    ],
  },
];

export default function PartnersPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
            Partner Endorsements
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
            Our Partners
          </h1>
          <p className="text-xl text-gray-300 mt-4 max-w-2xl">
            Read what industry leaders say about working with BotMakers Inc.
          </p>
        </div>
      </section>

      {/* Endorsement letters */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-24">
          {ENDORSEMENTS.map((endorsement, i) => (
            <AnimateOnScroll key={endorsement.author}>
              <div className="relative">
                {/* Decorative quote */}
                <div className="absolute -top-8 -left-4 text-[#03FF00]/10 text-9xl font-serif leading-none select-none pointer-events-none">
                  &ldquo;
                </div>

                <div className="relative">
                  {/* Letter content */}
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    {endorsement.paragraphs.map((p, pi) => (
                      <p key={pi}>{p}</p>
                    ))}
                  </div>

                  {/* Author card */}
                  <div className="mt-10 flex items-center gap-4 border-t border-gray-100 pt-8">
                    <div className="w-14 h-14 rounded-full bg-[#033457] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#03FF00] font-bold text-lg">
                        {endorsement.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#033457] text-lg">
                        {endorsement.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {endorsement.company}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {endorsement.date}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {i < ENDORSEMENTS.length - 1 && (
                  <div className="mt-20 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
