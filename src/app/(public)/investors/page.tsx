// SPEC: SPEC-PAGES > /investors — Investor relations page
import Link from "next/link";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";
import { LEADERSHIP_TEAM, COMPANY_INFO } from "@/lib/utils/company-data";
import { ExternalLink, FileText, Mail, TrendingUp, Users } from "lucide-react";

export const metadata = {
  title: "Investor Relations — BotMakers Inc. (OTC: BMAK)",
  description:
    "Investor relations for BotMakers Inc. (OTC: BMAK). Access stock information, press releases, SEC filings, and leadership team details.",
};

export default function InvestorsPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-medium text-[#03FF00] tracking-widest uppercase mb-4">
            Investor Relations
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
            {COMPANY_INFO.ticker}
          </h1>
          <p className="text-xl text-gray-300 mt-4 max-w-2xl">
            {COMPANY_INFO.name} — traded on {COMPANY_INFO.exchange}
          </p>
        </div>
      </section>

      {/* Stock chart placeholder */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="bg-white border border-gray-200 rounded-xl p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-[#033457]" />
                <h2 className="text-2xl font-bold text-[#033457]">
                  Stock Performance
                </h2>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-12 text-center">
                <p className="text-lg font-semibold text-[#033457]">
                  OTC: {COMPANY_INFO.ticker}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Stock chart widget will be available once trading data is
                  established. Visit{" "}
                  <a
                    href="https://www.otcmarkets.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#033457] underline hover:text-[#03FF00]"
                  >
                    OTC Markets
                  </a>{" "}
                  for the latest quote.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Press releases & SEC filings */}
      <section className="py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <AnimateOnScroll>
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-5 h-5 text-[#033457]" />
                  <h3 className="text-xl font-bold text-[#033457]">
                    Press Releases
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Latest company announcements and news
                </p>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#033457] hover:text-[#03FF00] transition-colors"
                >
                  View all press releases
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-5 h-5 text-[#033457]" />
                  <h3 className="text-xl font-bold text-[#033457]">
                    SEC Filings
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Access regulatory filings and disclosure documents
                </p>
                <a
                  href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=botmakers&CIK=&type=&dateb=&owner=include&count=40&search_text=&action=getcompany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#033457] hover:text-[#03FF00] transition-colors"
                >
                  View on SEC EDGAR
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Leadership team */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="flex items-center gap-3 mb-12">
              <Users className="w-6 h-6 text-[#033457]" />
              <h2 className="text-3xl font-bold text-[#033457]">
                Leadership Team
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {LEADERSHIP_TEAM.map((member, i) => (
              <AnimateOnScroll key={member.name} delay={i * 100}>
                <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-[#033457]/10 transition-all">
                  <div className="w-16 h-16 rounded-full bg-[#033457] flex items-center justify-center mb-4">
                    <span className="text-[#03FF00] font-bold text-xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#033457]">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-[#03FF00] mt-0.5">
                    {member.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Investor contact */}
      <section className="py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <AnimateOnScroll>
            <div className="max-w-xl mx-auto text-center">
              <Mail className="w-8 h-8 text-[#033457] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#033457] mb-4">
                Investor Contact
              </h2>
              <p className="text-gray-600 mb-6">
                For investor inquiries, financial information, or to schedule a
                call with management, please reach out to our investor relations
                team.
              </p>
              <a
                href={`mailto:${COMPANY_INFO.investorEmail}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#033457] text-white rounded-lg hover:bg-[#033457]/90 transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                {COMPANY_INFO.investorEmail}
              </a>
              <p className="text-sm text-gray-400 mt-4">
                {COMPANY_INFO.location}
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
