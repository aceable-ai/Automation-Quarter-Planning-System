export type InventorySection =
  | 'Standalone tools'
  | 'Other team tools'
  | 'Additional repos'
  | 'marketing-aceiq sub-tools'
  | 'Extras';

export type InventoryEntry = {
  section: InventorySection;
  name: string;
  hoursPerMonth: number | null;
  tool: string;
  purpose: string;
  confidence: string;
  owner: string;
};

export const Q2C2_INVENTORY: InventoryEntry[] = [
  { section: 'Standalone tools', name: '21 Foundational Content Generator INS/MTG', hoursPerMonth: 15, tool: 'n8n', purpose: 'Generates 21 foundational SEO content pieces for Insurance + Mortgage', confidence: 'Confident', owner: 'Peggy' },
  { section: 'Other team tools', name: 'ace-overwatch', hoursPerMonth: 8, tool: 'Neon', purpose: 'Backing DB for the alert-monitoring system', confidence: 'Needs owner input', owner: 'Peggy' },
  { section: 'Additional repos', name: 'aceable-marketing-repo', hoursPerMonth: 10, tool: 'GitHub repo', purpose: 'General marketing-projects bucket — non-internal tools, AI-as-copilot work', confidence: 'Estimate', owner: 'Peggy' },
  { section: 'Other team tools', name: 'aceable-rewards-bridge', hoursPerMonth: 0, tool: 'Railway / Next.js', purpose: 'DriversEd.com referral rewards storefront — Ambassador + Tremendous integration, pay-on-redemption', confidence: 'Confident', owner: 'Peggy' },
  { section: 'marketing-aceiq sub-tools', name: 'Analysis Lab', hoursPerMonth: 40, tool: 'marketing-aceiq /analysis-lab', purpose: 'Container for one-off / static custom analyses', confidence: 'Confident', owner: 'Peggy' },
  { section: 'Standalone tools', name: 'Automation Quarterly Planning', hoursPerMonth: 4, tool: 'Railway / Next.js', purpose: 'Original AQPS planning hub (superseded by Tool below)', confidence: 'Needs owner input', owner: 'Peggy' },
  { section: 'Standalone tools', name: 'Automation Quarterly Planning Tool', hoursPerMonth: 30, tool: 'Neon DB', purpose: 'Backing DB for current AQPS portfolio + 6-week cycles + scored backlog + feedback inbox', confidence: 'Counted with app', owner: 'Peter' },
  { section: 'Additional repos', name: 'bris-content-marketing', hoursPerMonth: 6, tool: 'GitHub repo', purpose: 'SEO/Content team’s central research repo', confidence: 'Estimate', owner: 'Peter' },
  { section: 'marketing-aceiq sub-tools', name: 'Campaign Builder (Google + bulk paid-ad)', hoursPerMonth: 2, tool: 'marketing-aceiq /campaign-builder', purpose: 'Builds Google campaigns + bulk builder for other paid-ad platforms; started for Aceable Agent — expanding to all brands/verticals', confidence: 'Estimate', owner: 'Peter' },
  { section: 'Additional repos', name: 'ClipHound', hoursPerMonth: 3, tool: 'GitHub repo', purpose: 'Unknown — confirm purpose with Steven Wilson', confidence: 'Enablement', owner: 'Peter' },
  { section: 'Extras', name: 'Content Automated Publishing', hoursPerMonth: 20, tool: 'TBD', purpose: 'Automated publishing pipeline for content team', confidence: 'Confident', owner: 'Patricia' },
  { section: 'Standalone tools', name: 'Content Optimizer AA', hoursPerMonth: 6, tool: 'n8n', purpose: 'SEO/content optimization for AceableAgent', confidence: 'Estimate', owner: 'Valencia' },
  { section: 'Standalone tools', name: 'Content Optimizer DRV', hoursPerMonth: 10, tool: 'n8n', purpose: 'SEO/content optimization for Driver’s Ed brands', confidence: 'Needs owner input', owner: 'Needs owner input' },
  { section: 'Standalone tools', name: 'Content Topicer', hoursPerMonth: 8, tool: 'Railway', purpose: 'Topic discovery for content team — folding into Content Master tool as a future feature', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Other team tools', name: 'finance-agent-skills', hoursPerMonth: 4, tool: 'Railway', purpose: 'Skills library for the finance team (Q2 planning output)', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Additional repos', name: 'groupon-redemption-automation', hoursPerMonth: 3, tool: 'GitHub repo', purpose: 'Groupon voucher API redemption automation', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Standalone tools', name: 'GTM Automation App', hoursPerMonth: 40, tool: 'Railway / Next.js', purpose: 'PMM-facing UX for GTM launches: one-pagers, competitor data, tasks, asset pickup', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Standalone tools', name: 'GTM Database (active)', hoursPerMonth: 4, tool: 'Neon DB', purpose: 'Backing DB for GTM Automation App', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'Historical Ad Performance', hoursPerMonth: 6, tool: 'marketing-aceiq /historical-ad-performance', purpose: 'Cross-platform historical ad performance lookups', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'iDS Search Pacing', hoursPerMonth: 4, tool: 'marketing-aceiq /ids-search-pacing', purpose: 'iDriveSafely-specific paid-search pacing', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'Influencer Dashboard', hoursPerMonth: 8, tool: 'marketing-aceiq /influencer-dashboard', purpose: 'Sprout Influencer Marketing — campaigns + post metrics', confidence: 'Estimate', owner: 'James' },
  { section: 'Extras', name: 'INS Paid Competitor Monitor', hoursPerMonth: 6, tool: 'n8n + Neon (AceIQ ingest)', purpose: 'SerpAPI scrape of Google Search Ads for insurance pre-licensing keywords; pipes into AceIQ', confidence: 'Estimate', owner: 'Peggy' },
  { section: 'Standalone tools', name: 'Iterable Email Creator', hoursPerMonth: 0, tool: 'Railway / Next.js', purpose: 'Brand/vertical-aware Iterable email assembler (RE/INS/MTG/DRV-IDS/DRV-DEC/DRV-ACE) — folding into DIS as a future feature', confidence: 'Confident', owner: 'Peggy' },
  { section: 'Other team tools', name: 'lifecycle-claude-101', hoursPerMonth: 8, tool: 'Railway', purpose: 'Claude 101 enablement for Lifecycle team', confidence: 'Needs owner input', owner: 'Peggy' },
  { section: 'Extras', name: 'LLM Visibility Tracker', hoursPerMonth: 10, tool: 'Railway / Next.js (youtube-llm-tracker repo)', purpose: 'Tracks Aceable YouTube videos appearing in AI Overviews / LLM responses', confidence: 'Estimate', owner: 'Peggy' },
  { section: 'Other team tools', name: 'marketing-aceiq (parent)', hoursPerMonth: 30, tool: 'Railway / Next.js', purpose: 'Marketing reporting / analysis dashboard suite — Paid Media campaign optimization (umbrella for ~21 sub-tools below)', confidence: 'Estimate', owner: 'Peggy' },
  { section: 'Additional repos', name: 'marketing-dilligence', hoursPerMonth: 10, tool: 'GitHub repo', purpose: 'Marketing site for diligence (M&A / due-diligence collateral)', confidence: 'Counted with app', owner: 'Peggy' },
  { section: 'Additional repos', name: 'marketing-seo', hoursPerMonth: 0, tool: 'GitHub repo', purpose: 'SEO marketing repo', confidence: 'Confident', owner: 'Peggy' },
  { section: 'Other team tools', name: 'marketing-tiktok-scraper-tool', hoursPerMonth: 20, tool: 'Railway', purpose: 'TikTok content scraper for marketing intelligence', confidence: 'Confident', owner: 'Peggy' },
  { section: 'marketing-aceiq sub-tools', name: 'Meta Ad Insights', hoursPerMonth: 25, tool: 'marketing-aceiq /aceiq', purpose: 'Daily Meta paid-social campaign + ad-set + ad performance dashboard', confidence: 'Estimate', owner: 'Peggy' },
  { section: 'Additional repos', name: 'mkt-cb-bulk-buy', hoursPerMonth: 4, tool: 'GitHub repo (forkable template)', purpose: 'Bulk-buy program forkable template', confidence: 'Needs owner input', owner: 'Peggy / Caren' },
  { section: 'Additional repos', name: 'mkt-cb-student-referral-program', hoursPerMonth: 12, tool: 'GitHub repo', purpose: 'Student referral program tooling', confidence: 'Estimate', owner: 'Marissa' },
  { section: 'Other team tools', name: 'mktg-ace-overwatch', hoursPerMonth: 6, tool: 'Railway / Next.js', purpose: 'Marketing alert monitoring dashboard (uptime / pipeline alerts)', confidence: 'Estimate', owner: 'Peter' },
  { section: 'Additional repos', name: 'mktg-io', hoursPerMonth: 2, tool: 'Railway / Next.js', purpose: 'Input/output tracking dashboard for marketing', confidence: 'Estimate', owner: 'Peter' },
  { section: 'Additional repos', name: 'mktg-skills', hoursPerMonth: 0, tool: 'GitHub repo', purpose: 'Shared marketing-skills template repo for the team', confidence: 'Confident', owner: 'Peter' },
  { section: 'Additional repos', name: 'mktg-team-agents', hoursPerMonth: 0, tool: 'GitHub repo', purpose: 'Custom Claude/AI agents for marketing leadership', confidence: 'Confident', owner: 'Peter' },
  { section: 'Other team tools', name: 'n8n (Peter)', hoursPerMonth: 15, tool: 'Railway', purpose: 'Internal n8n setup/admin entry', confidence: 'Enablement, not throughput', owner: 'Peter' },
  { section: 'Additional repos', name: 'n8n-builder-agent', hoursPerMonth: 10, tool: 'GitHub repo', purpose: 'Agent that builds n8n workflows', confidence: 'Enablement', owner: 'Peter' },
  { section: 'marketing-aceiq sub-tools', name: 'Organic Boost', hoursPerMonth: 8, tool: 'marketing-aceiq /organic-boost', purpose: 'Identifies high-performing organic posts to boost into paid', confidence: 'Rolled up via subs', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'Paid Search Pacing', hoursPerMonth: 8, tool: 'marketing-aceiq /paid-search-pacing', purpose: 'Google + Bing pacing dashboard', confidence: 'Needs owner input', owner: 'Victoria' },
  { section: 'marketing-aceiq sub-tools', name: 'Paid Search Performance', hoursPerMonth: 10, tool: 'marketing-aceiq /paid-search-performance', purpose: 'Paid-search campaign performance views', confidence: 'Needs owner input', owner: 'Needs owner input' },
  { section: 'marketing-aceiq sub-tools', name: 'Paid Social Ad Report', hoursPerMonth: 8, tool: 'marketing-aceiq /paid-social-report', purpose: 'Cross-brand paid-social executive report (with feedback loop into AQPS)', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Additional repos', name: 'partner-marketing-toolkit', hoursPerMonth: 4, tool: 'GitHub repo', purpose: 'Partner marketing assets / toolkit', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'PMax Creative Performance', hoursPerMonth: 6, tool: 'marketing-aceiq /pmax-creative', purpose: 'Performance Max creative-asset performance breakdown', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'Pre-Licensing Forecast (Monthly Pacing)', hoursPerMonth: 6, tool: 'marketing-aceiq /monthly-pacing', purpose: 'Monthly pacing + forecast for pre-licensing brands', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'Promo Tracker', hoursPerMonth: 4, tool: 'marketing-aceiq /promo-tracker', purpose: 'In-AceIQ promo tracking surface (related to standalone Promo Hub)', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Standalone tools', name: 'Promotion Automation Database', hoursPerMonth: 6, tool: 'Neon DB', purpose: 'Backing DB for Promotion Automation Hub (migrating from Airtable)', confidence: 'Estimate', owner: 'Rob' },
  { section: 'Standalone tools', name: 'Promotion Automation System App', hoursPerMonth: 45, tool: 'Railway / Next.js', purpose: 'PMM promo-campaign hub: briefs intake, asset pickup, calendar, codes, cadence', confidence: 'Estimate', owner: 'Rob' },
  { section: 'marketing-aceiq sub-tools', name: 'Search Query Analyzer', hoursPerMonth: 8, tool: 'marketing-aceiq /search-query-analyzer', purpose: 'Search-term performance + waste/coverage analysis', confidence: 'Estimate', owner: 'James' },
  { section: 'marketing-aceiq sub-tools', name: 'Seasonal Predictive Bidding (LiftLab)', hoursPerMonth: 6, tool: 'marketing-aceiq /liftlab-bidding', purpose: 'LiftLab vendor-fed weekly mROAS + bid recommendations', confidence: 'Estimate', owner: 'Peggy' },
  { section: 'marketing-aceiq sub-tools', name: 'Social Command Center', hoursPerMonth: 2, tool: 'marketing-aceiq /organic-command-center', purpose: 'Org-wide organic-social posting + engagement dashboard', confidence: 'Needs owner input', owner: 'Taylor McKinney' },
  { section: 'Extras', name: 'Social Media Content Planner', hoursPerMonth: 4, tool: 'TBD (likely Railway/Next.js)', purpose: 'Plan + schedule social content across brands', confidence: 'Needs owner input', owner: 'Casey' },
  { section: 'Additional repos', name: 'Social_calendar', hoursPerMonth: 10, tool: 'GitHub repo', purpose: 'Social calendar workflow — same as Victoria’s Social Media Content Planner above', confidence: 'Folded with Extras row', owner: 'Victoria' },
  { section: 'marketing-aceiq sub-tools', name: 'TikTok Ad Insights', hoursPerMonth: 4, tool: 'marketing-aceiq /tiktok', purpose: 'Daily TikTok paid-social campaign + ad-group + ad performance dashboard', confidence: 'Needs owner input', owner: 'Bri' },
  { section: 'Standalone tools', name: 'Topic Suggester', hoursPerMonth: null, tool: 'n8n', purpose: 'Auto-suggest blog/SEO topics from competitor + Reddit + internal content gaps', confidence: 'Enablement', owner: 'Peggy' },
  { section: 'Other team tools', name: 'vibe-coding-102', hoursPerMonth: 6, tool: 'Railway', purpose: 'Vibe Coding 102 course / forkable', confidence: 'Estimate', owner: 'Needs owner input' },
  { section: 'Other team tools', name: 'vibe-coding-course', hoursPerMonth: 6, tool: 'Railway', purpose: 'Vibe Coding 101/102 course materials', confidence: 'Estimate', owner: 'Peter' },
  { section: 'Standalone tools', name: 'Visual Design Builder – Caren', hoursPerMonth: 4, tool: 'Railway / Next.js', purpose: 'Caren’s design-builder tool. Brand/vertical-aware Iterable email assembler (RE/INS/MTG/DRV-IDS/DRV-DEC/DRV-ACE) — folding into DIS as a future feature', confidence: 'Estimate', owner: 'Peter' },
];

export const SECTION_ORDER: InventorySection[] = [
  'Standalone tools',
  'Other team tools',
  'Extras',
  'marketing-aceiq sub-tools',
  'Additional repos',
];

export const SECTION_COLORS: Record<InventorySection, string> = {
  'Standalone tools': '#5BB8C9',
  'Other team tools': '#E94B7B',
  'Extras': '#F2B93B',
  'marketing-aceiq sub-tools': '#4FC79B',
  'Additional repos': '#4070B5',
};
