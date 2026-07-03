# BotMakers Website — Next Steps

## Current State (July 2, 2026)

### What's Done (Backend — all working, keep as-is)
- **News system**: Full article CRUD with Tiptap rich text editor
  - Schema: `articles` table in `src/lib/db/schema.ts`
  - Types: `src/lib/types/news.ts`
  - Queries: `src/lib/db/queries/news.ts`
  - Actions: `src/lib/actions/news.ts`
  - Slug utility: `src/lib/utils/slugify.ts`
  - Image upload API: `src/app/api/admin/upload/route.ts`
- **Admin news pages**: list, create, edit at `/admin/news`
  - `src/app/admin/news/page.tsx` (list + status cards)
  - `src/app/admin/news/new/page.tsx` (create)
  - `src/app/admin/news/[id]/page.tsx` (edit)
- **Article editor**: `src/components/admin/article-editor.tsx`
- **Tiptap editor**: `src/components/admin/tiptap-editor.tsx`
- **Sidebar updated**: News link added to admin sidebar
- **New public pages** (created but not linked in nav yet):
  - `/news` — public news listing
  - `/news/[slug]` — article detail with SEO metadata
  - `/partners` — full endorsement letter text
  - `/investors` — investor relations page
  - `/contact` — contact page with lead form
  - `/about` — about page with leadership team
- **Company data**: `src/lib/utils/company-data.ts` (leadership team, company info, client logos)
- **Homepage components** (created but not used — available for future use):
  - `src/components/shared/hero-section.tsx`
  - `src/components/shared/services-section.tsx`
  - `src/components/shared/trusted-by-section.tsx`
  - `src/components/shared/testimonial-carousel.tsx`
  - `src/components/shared/latest-news-section.tsx`
  - `src/components/shared/quick-contact-form.tsx`
  - `src/components/shared/public-nav.tsx`
  - `src/components/shared/animate-on-scroll.tsx`
  - `src/hooks/use-in-view.ts`
- **CSS animations**: Keyframes added to `globals.css` (bm-fade-in-up, bm-gradient-shift, bm-float, etc.)
- **Client logos**: Copied to `/public/logos/`

### What's Reverted
- **Homepage** (`src/app/(public)/page.tsx`) — reverted to original design
- **Public layout** (`src/app/(public)/layout.tsx`) — reverted to original nav/footer

### What Still Needs Setup (Infrastructure)
1. **Database migration**: Run `npx drizzle-kit generate && npx drizzle-kit push` to create `articles` table
2. **Supabase Storage**: Create a public bucket called `article-images`
3. **Bryan's credentials**: Add row to `team_users` table + create Supabase Auth user
4. **Vercel**: Account is paused (exceeded free tier Blob Data Transfer). Upgrade or wait for reset.

---

## Planned Enhancements (Discussed, Not Yet Implemented)

Keep the current homepage design (user loves it) but layer in authority signals for a publicly traded company:

### 1. Hero Upgrade
- Update hero messaging to convey "accomplishing big things successfully"
- Add OTC: BMAK ticker badge in the header
- Bold category-claiming headline (5-10 words, Palantir-style)
- Single dominant CTA

### 2. Social Proof / Metrics Bar
- Add hard numbers below the hero (projects delivered, client retention, revenue growth)
- Client logo bar (6-8 grayscale logos): 3 Mark, Apex, Colonial Stock, D. Miller, iHost Poker, VoiceMetrics

### 3. Endorsement Section
- Feature key quotes from the 3 endorsement letters on the homepage:
  - **Betsy Riley** (3 Mark Financial) — SmartViews + Doc2Video
  - **Bill Propper** (CEO, Apex Affinity Group) — exclusive AI partner
  - **Philip Resch** (Valor Financial Specialists) — real-time intelligence platform

### 4. Investors Page (OTC Compliance)
- Stock quote widget with OTC: BMAK pricing
- Press releases (from news system, tagged "press-release")
- SEC filing links
- Corporate governance (board bios, code of ethics)
- Financial highlights at-a-glance
- Safe Harbor statement
- Transfer agent info
- Email alerts subscription

### 5. News/Press Integration
- Add "News" and "Investors" links to public nav
- Surface 3 most recent articles on homepage
- Press releases page for investor communications

---

## Research Highlights (Top Tech Company Patterns)

### Best Model for BMAK: Palantir
- Bold category claim headline
- Third-party validation immediately below hero
- Quantified proof points with specific numbers
- Trademarked tagline pattern: "Foundational Software of Tomorrow. Delivered Today."

### Trust Architecture (Top to Bottom)
1. Above fold: Category headline + CTA + stock ticker
2. First scroll: Client logo bar or quantified proof
3. Second scroll: Product/service showcase
4. Third scroll: Analyst badges, media mentions, awards
5. Fourth scroll: Customer testimonials / case studies
6. Footer: Comprehensive links, compliance, social

### Non-Negotiables for Public Company Website
- Stock ticker visible in header/hero
- Dedicated Investors page with SEC filings
- Press releases archived chronologically
- Safe Harbor statement
- Corporate governance documents
- Mobile responsive (83% of investors use mobile)

---

## Git State
- **Branch**: `master`
- **Latest commit**: `e526823` (full redesign — includes backend + reverted public pages)
- **Remote**: `origin/main` has the code (force-pushed)
- **Vercel**: Paused due to free tier limits
- **Endorsement PDFs**: `assets/betsy-endorsement.pdf`, `assets/bill-endorsement.pdf`, `assets/phil-endorsement.pdf`
