import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#033457] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#03FF00] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl lg:text-5xl font-light text-white mb-4">
            BioQuest, Inc. Acquires BotMakers, Inc. to{" "}
            <span className="font-medium">Revolutionize Conversational AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Trent T. Daniel Named CEO to Lead Sales, Branding and Expansion Initiatives
          </p>
          <div className="flex items-center gap-4 text-gray-300">
            <span className="text-sm">KATY, TX</span>
            <span className="w-1 h-1 rounded-full bg-[#03FF00]"></span>
            <span className="text-sm">March 19, 2025</span>
            <span className="w-1 h-1 rounded-full bg-[#03FF00]"></span>
            <span className="text-sm">Press Release</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16">
        <div className="max-w-3xl">
          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              <strong className="text-[#033457]">BioQuest, Inc. (OTC PINK:BQST)</strong>, a publicly traded company on the OTC Markets, has officially completed its acquisition of BotMakers, Inc., a leader in AI-powered conversational technology. This strategic move strengthens BioQuest&apos;s position in the AI automation sector and marks a significant step toward its long-term vision of becoming a dominant player in enterprise-level AI solutions. With this acquisition, BioQuest has appointed Trent T. Daniel as its new Chief Executive Officer, effective immediately.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              BioQuest has recently been trading at over $1 per share and previously filed a $5 million Regulation A offering, which was cleared by the SEC late last year. The company intends to use the proceeds from this funding to scale its marketing and branding efforts while accelerating the development of the BotMakers platform. This platform will provide cutting-edge automated digital workforce solutions for government agencies, corporations, and law enforcement organizations.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              BotMakers, Inc. has built a strong reputation for delivering enterprise-grade AI voice and messaging automation. With growing demand and a robust pipeline of contracts, the company expects to generate revenues exceeding $1.2 million this year, with a long-term goal of reaching $5 million by the end of 2026. The company&apos;s expanding roster of enterprise clients includes Infinity Concepts, Colonial Stock Transfer, United Israel Charity, Shield Funding, iHost Poker Casino Parties, Kid Fit Strong, and ProMarketing Leads, highlighting its ability to deploy scalable AI solutions across diverse industries.
            </p>

            {/* Quote Block */}
            <blockquote className="border-l-4 border-[#03FF00] pl-6 py-4 my-8 bg-gray-50">
              <p className="text-xl text-[#033457] font-medium italic mb-4">
                &quot;This acquisition represents a major step forward for BioQuest as we embrace AI-driven automation. With BotMakers&apos; technology and expertise, we are well-positioned to scale our offerings and drive innovation in the enterprise AI space. Our mission is to provide businesses with intelligent, automated solutions that redefine operational efficiency.&quot;
              </p>
              <cite className="text-gray-600 not-italic">
                — Trent T. Daniel, CEO of BioQuest
              </cite>
            </blockquote>

            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              Further solidifying its presence in the AI sector, BotMakers has secured a high-profile contract with 3Mark Financial, one of the nation&apos;s largest life insurance wholesalers, to implement its state-of-the-art conversational AI technology. This partnership highlights the growing demand for AI-driven automation in financial services and beyond.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              Looking ahead, BioQuest plans to rebrand as BotMakers, Inc. to better align with its core expertise in AI innovation. The company is also in active negotiations to acquire an AI-powered marketing leads company, which currently generates over $1 million per year in revenue. This acquisition would further strengthen BioQuest&apos;s capabilities and reinforce its commitment to becoming the premier provider of enterprise-level AI solutions through continued investment in technology, strategic partnerships, and market expansion.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg mb-8">
              For more information, please visit{" "}
              <a href="https://www.botmakers.ai" className="text-[#033457] hover:text-[#03FF00] transition-colors font-medium">
                www.botmakers.ai
              </a>
            </p>
          </div>

          {/* Contact Information */}
          <section className="p-8 bg-gray-50 border border-gray-100 mb-12">
            <h2 className="text-xl font-medium text-[#033457] mb-4">
              Media Contact
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Contact:</span> Tamares Davis
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a
                  href="mailto:tdavis@botmakers.ai"
                  className="text-[#033457] hover:text-[#03FF00] transition-colors"
                >
                  tdavis@botmakers.ai
                </a>
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                <a
                  href="tel:1-866-753-8002"
                  className="text-[#033457] hover:text-[#03FF00] transition-colors"
                >
                  1-866-753-8002
                </a>
              </p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section className="text-xs text-gray-500 leading-relaxed space-y-4 border-t border-gray-200 pt-8">
            <h3 className="font-medium text-gray-600 text-sm">Notice Regarding Forward-Looking Statements</h3>
            <p>
              Safe Harbor Statement under the Private Securities Litigation Reform Act of 1995: This news release contains forward-looking information within the meaning of Section 27A of the Securities Act of 1933, as amended, and Section 21E of the Securities Exchange Act of 1934, as amended. These forward-looking statements involve known and unknown risks, uncertainties, and other factors that may cause the actual results, performance, or achievements of the company to differ materially from those expressed or implied by such forward-looking statements.
            </p>
            <p>
              This press release contains forward-looking statements within the meaning of the Private Securities Litigation Reform Act of 1995. These statements are based on current expectations, estimates, and projections about BioQuest, Inc.&apos;s and BotMakers, Inc.&apos;s industry, management&apos;s beliefs, and certain assumptions made by the company. Forward-looking statements are typically identified by words such as &quot;anticipates,&quot; &quot;believes,&quot; &quot;expects,&quot; &quot;intends,&quot; &quot;plans,&quot; &quot;projects,&quot; &quot;seeks,&quot; &quot;estimates,&quot; and similar expressions.
            </p>
            <p>
              These forward-looking statements are not guarantees of future performance and are subject to risks, uncertainties, and other factors, some of which are beyond the company&apos;s control, that could cause actual results to differ materially from those expressed or implied in these statements. These risks and uncertainties include, but are not limited to, general economic conditions, changes in industry trends, competitive pressures, regulatory changes, and the company&apos;s ability to secure additional contracts and strategic partnerships.
            </p>
            <p>
              Investors are cautioned not to place undue reliance on forward-looking statements, which speak only as of the date of this release. BioQuest, Inc. and BotMakers, Inc. undertake no obligation to update or revise any forward-looking statements, whether as a result of new information, future events, or otherwise, except as required by law.
            </p>
          </section>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/#contact"
              className="px-8 py-4 text-sm font-medium text-center transition-colors bg-[#033457] hover:bg-[#022a45] text-white"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="px-8 py-4 text-sm font-medium text-center transition-colors border border-gray-300 hover:border-[#033457] text-[#033457]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
