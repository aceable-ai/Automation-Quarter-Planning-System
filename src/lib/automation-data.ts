export interface Initiative {
  n: string;
  s: number;
  j?: string;
  f?: string;
}

export interface Project {
  n: string;
  p: string;
  q: string;
  cap: string;
  imp: string;
  r?: boolean;
  i: Initiative[];
}

export interface Track {
  t: string;
  d: string;
  c: string;
  s: Project[];
}

export const arch: Track[] = [
  {
    t: "Course Lifecycle",
    d: "Build, configure, launch, and maintain the thing we sell",
    c: "#7c3aed",
    s: [
      {
        n: "CL: Course Content Factory", r: true, imp: "High",
        p: "Automates course content production across the LX pipeline — AI-powered question generation and subtopic tagging, voiceover production (including accessible audio for image descriptions), dynamic text rendering, and FRIDAY model integration into Jarvis. Includes tooling for visual communications, course metadata access, version tracking, and tone/style consistency.",
        q: "Q2 2026", cap: "Marcela",
        i: [
          { n: "Responsive Design for EDU Imagery", s: 15 },
          { n: "Consistent Tone/Style Output from AI (FRIDAY)", s: 13.5 },
          { n: "Accessible Audio for Image Descriptions", s: 13 },
          { n: "AI-Powered Question Tagging & Generation", s: 13 },
          { n: "Scale Voice Over/Dynamic Text Content + Voiceover", s: 13 },
          { n: "Promotions + Voiceover Pickups", s: 13 },
          { n: "Explore Jarvis API Access for AI Course Building", s: 13 },
          { n: "Easily Accessible Course Metadata", s: 13 },
          { n: "Add Version and Tool Tracking to Course Building Guide", s: 13 },
          { n: "Can AI Help Us Figure Out Course Versioning", s: 13, j: "ENGM-84" },
          { n: "Migrate FRIDAY into Jarvis", s: 12.5 },
          { n: "Question Submission Doc View for Mortgage", s: 12.5 },
          { n: "Leverage AI to Assign Subtopics", s: 12.5, j: "ENGM-83" },
          { n: "Course Topic Readouts via n8n", s: 12, j: "ENGM-79" },
          { n: "LX VizComm + AI/Automation Tooling", s: 11.5 },
          { n: "Integrate Subtopic Assignment into Friday", s: 11.5 },
        ],
      },
      {
        n: "CL: Product Config Automation", imp: "",
        p: "Automates the repetitive setup work required to make a course sellable — SKU creation, pricing configuration, coupon generation (via n8n and Stripe), landing page setup in Craft, Jarvis product records, calendar event sync, and promotions management.",
        q: "Q2 2026", cap: "Marcela",
        i: [
          { n: "Course Creation in Craft WF", s: 12.5, j: "MAUT-24" },
          { n: "Details from Trigger - Create All Products for Launch", s: 11.5 },
          { n: "Coupon Generation via n8n", s: 11, j: "ENGM-77", f: "this is done" },
          { n: "Jarvis Events Calendar Integration", s: 10.5 },
          { n: "Course Creation in Jarvis WF", s: 10, j: "MAUT-22" },
          { n: "Quickly Create New Products in Jarvis", s: 10 },
          { n: "Craft: Auto Sales/Coupon Creation", s: 10, j: "ENGM-45" },
          { n: "Product Generation via n8n", s: 9.5, j: "ENGM-80" },
          { n: "Move Promotions Process into Jarvis", s: 9.5 },
        ],
      },
      {
        n: "CL: Regulatory Requirements Mapper", r: true, imp: "High",
        p: "Automates the intake and structuring of regulatory requirements — scraping state regulatory websites, triaging ~14k annual regulatory emails, pulling monthly TDLR data requests, and generating vertical-specific cheat sheet templates.",
        q: "Q2 2026", cap: "Marcela (Amanda Ellen Nat)",
        i: [
          { n: "Cheat Sheet Template Generation by Vertical", s: 13 },
          { n: "Streamline Regulatory Management: Scraping & Inbox Crawling", s: 7 },
          { n: "Monthly Driving Data Request - TDLR", s: 7 },
          { n: "Regulatory Inbox Triage", s: 0 },
        ],
      },
      {
        n: "CL: Regulatory Submission Automation", imp: "High",
        p: "Assembles jurisdiction-specific approval documentation and submits to regulatory bodies on defined schedules. Includes automating recurring state reports.",
        q: "Q2 2026", cap: "Marcela (Heather Amanda Nat)",
        i: [{ n: "Quarterly DRV CA TVS Reports - ACE and IDS", s: 9.5 }],
      },
      {
        n: "CL: Continuous Compliance Renewal", imp: "High",
        p: "Tracks renewal deadlines for course approvals, school licenses, instructor credentials, and bonds. Outputs proactive alerts and pre-filled renewal packages.",
        q: "Q2 2026", cap: "Marcela (Nat)",
        i: [],
      },
      {
        n: "CL: Launch Orchestration System", imp: "Medium",
        p: "Coordinates the full launch checklist across Product, CX, Engineering, Marketing, and Regulatory — from promo calendar through environment promotion, PMO tracking, and student migration for re-launches.",
        q: "Q3 2026", cap: "Marcela",
        i: [
          { n: "OKR 3 - New Course Launch Automation", s: 14.5, j: "MAUT-61" },
          { n: "Evaluate Pre-Built Promo Calendar Integration", s: 14.5, j: "MAUT-178" },
          { n: "Unified Launch & Campaign Calendar", s: 14.5, j: "MAUT-190" },
          { n: "PMO Course Launch Support", s: 14.5 },
          { n: "Dual Environment Promotion (PROD + STG)", s: 14.5 },
          { n: "Student Migration Automation (Re-launch)", s: 14.5 },
        ],
      },
      {
        n: "CL: Hypercare Monitoring Dashboard", imp: "Med-High",
        p: "Aggregates post-launch signals — support tickets, app store reviews, Iterable alerts, ecommerce change logs, webinar tech issues, and product feedback — into a single real-time view.",
        q: "Q3 2026", cap: "Ellen",
        i: [
          { n: "Product Feedback Processing Agent", s: 16 },
          { n: "Iterable API Jira Alerts", s: 16 },
          { n: "Ecomm Change Log Intelligence", s: 16 },
          { n: "AI Conversation Intelligence", s: 15 },
          { n: "Improve Webinar Tech Self-Service", s: 15 },
          { n: "Automated Voice Handling", s: 15 },
          { n: "App Store Reviews", s: 15 },
          { n: "Review & Sentiment Tracker - STUDENT Intelligence", s: 14 },
        ],
      },
      {
        n: "CL: Sunset Orchestration", imp: "",
        p: "Manages structured wind-down of a course — notifying students and partners, unpublishing storefronts, fulfilling remaining obligations, and archiving systems.",
        q: "Ice box", cap: "Marcela",
        i: [],
      },
      {
        n: "CL: AI QA & Review Pipeline", r: true, imp: "",
        p: "Automated quality checks before any artifact advances — cross-brand HTML linting, product/coupon validation in Craft, Jarvis settings QA, document verification for student accounts, and word count accuracy across courses.",
        q: "TBD", cap: "TBD",
        i: [
          { n: "Cross-Brand Consistency", s: 15 },
          { n: "Product + Coupon Validation in Craft", s: 13.5, j: "ENGM-36" },
          { n: "Generate QA List for Jarvis Mortgage Courses", s: 13.5 },
          { n: "Document Verification", s: 13.5 },
          { n: "Get Accurate Word Count Across Courses", s: 13.5 },
        ],
      },
      {
        n: "CL: Vertical Knowledge Base", imp: "High",
        p: "Searchable aggregate of course catalog with standardized taxonomy, course versioning history, AI tool/version tracking tied to editor feedback, auto-generated product docs (Docbot), and accessible course metadata.",
        q: "Q2-Q4 2026", cap: "Ellen",
        i: [
          { n: "Course Catalog & Product Taxonomy Standardization", s: 13 },
          { n: "Docbot for Product Docs", s: 13 },
        ],
      },
    ],
  },
  {
    t: "B2C Growth",
    d: "Market, measure, and sell to consumers across all channels",
    c: "#2563eb",
    s: [
      {
        n: "CL: SEO Content Factory", r: true, imp: "High",
        p: "Automates the end-to-end marketing content pipeline — from AI-assisted research and drafting through CMS publishing via Craft/Feedme, schema markup generation, and cross-format repurposing (blog-to-video, YouTube briefs). Includes automated content updates, SEO-structured data bots, and channel-specific ad asset creation.",
        q: "Q2 2026", cap: "Peggy",
        i: [
          { n: "Rewrite Auto Publish to Craft", s: 17, j: "MAUT-16" },
          { n: "Research Content Generator", s: 17, j: "MAUT-12" },
          { n: "Net New Auto Publish to Craft - Feedme", s: 17, j: "MAUT-17", f: "Already in the works" },
          { n: "Auto Craft/Feedme Content Creation", s: 13, j: "ENGM-44" },
          { n: "Auto Craft/Feedme Content Update", s: 13, j: "ENGM-60" },
          { n: "Schema Bot", s: 13, j: "ENGM-52" },
          { n: "YouTube Video Brief Plugin", s: 12.5, j: "MAUT-92" },
          { n: "DEC Content Total Automation", s: 12, j: "MAUT-127" },
          { n: "Schema Generator: Research", s: 12, j: "MAUT-40" },
          { n: "Blog-to-Video Automation", s: 12, j: "MAUT-95" },
          { n: "Schema Generator: Product Pages", s: 11.5, j: "MAUT-41" },
          { n: "LinkedIn Presence & Outreach Sequences", s: 8 },
          { n: "WF3 Complex API Connections", s: 10.5, j: "MAUT-4" },
        ],
      },
      {
        n: "CL: Market Signal Intelligence", r: true, imp: "Med-High",
        p: "Monitors search trends, competitor content gaps, audience behavior, and social platform signals. Includes topic monitoring, gap analysis, TikTok trend scraping, research insight synthesis, and code-level SEO analysis.",
        q: "Q2-Q3 2026", cap: "Peggy (Rob)",
        i: [
          { n: "Gap Finder", s: 17, j: "MAUT-11" },
          { n: "Topic Suggester", s: 17, j: "MAUT-15" },
          { n: "Analyse Code Level SEO Improvements", s: 9, j: "ENGM-50" },
          { n: "Topic Monitoring System", s: 9, j: "MAUT-9" },
          { n: "Market Share Report", s: 0 },
          { n: "TikTok Research-to-Brief Scraper", s: 8, j: "MAUT-148" },
          { n: "Research Insights Bot", s: 8 },
          { n: "Monthly Market Share Datasets/Dashboard Refresh", s: 8 },
        ],
      },
      {
        n: "CL: GTM Asset Pipeline", r: true, imp: "High",
        p: "Generates the full suite of launch marketing assets — landing pages, paid social creative, organic social content, search ad copy, email campaigns, visual tickets, and app copy — from reusable templates per vertical.",
        q: "Q2 2026", cap: "Peggy",
        i: [
          { n: "Search Ad Copy Testing Automation", s: 15.5, j: "MAUT-106" },
          { n: "Campaign Management System", s: 15, j: "MAUT-55" },
          { n: "Landing Page Generator", s: 15, j: "MAUT-13", f: "Duplicative of Product LP WF" },
          { n: "Product Landing Page Generator WF", s: 15, j: "MAUT-23" },
          { n: "Visual Ticket/Image Generator", s: 15, j: "MAUT-101" },
          { n: "Organic Social Content Generation", s: 15, j: "MAUT-58" },
          { n: "Automated Paid Social Content Gen Pipeline", s: 15, j: "MAUT-102", f: "Will be part of DIS" },
          { n: "Sprout Social Automation", s: 15, j: "MAUT-44" },
          { n: "Discovery & Requirements Gathering - Advertising Rules", s: 14, j: "MAUT-117" },
          { n: "Email Campaign QA & Pre-Launch", s: 13.5 },
          { n: "Email Audience & Segmentation Automation", s: 8 },
          { n: "GTM One Pager Brief", s: 0 },
          { n: "Paid Social Creative Historical Winners Library", s: 0, j: "MAUT-107" },
          { n: "App Copy Generation", s: 0 },
        ],
      },
      {
        n: "CL: Design Intelligence System", r: true, imp: "",
        p: "Sits upstream of any DAM as the creative intelligence layer. Takes a campaign brief and generates brand-compliant assets for every channel. Tracks visual performance. Recommends proven assets before generating new ones. Gives channel teams self-serve access while design sets the guardrails.",
        q: "Q2 2026", cap: "Peggy",
        i: [{ n: "Design Intelligence System", s: 13, f: "NEW SYSTEM" }],
      },
      {
        n: "CL: Performance Insight Engine", r: true, imp: "Med-High",
        p: "Aggregates performance data across SEO, Lifecycle, CRO, Paid Media, and Organic Social into a single intelligence layer. Includes automated reporting, real-time alerting, paid search pacing, CRO tracking, lifecycle dashboards, channel attribution anomaly detection, and DMCA automation.",
        q: "Q2 2026", cap: "Peggy (Rob Ellen)",
        i: [
          { n: "Influencer Reporting", s: 16, j: "MAUT-43" },
          { n: "GSC Alerts", s: 16, j: "MAUT-35" },
          { n: "Ahrefs MCP Alerts", s: 16, j: "MAUT-36" },
          { n: "Performance Monitoring & Reporting", s: 16, j: "MAUT-57" },
          { n: "AceIQ: Paid Search Budget Pacing", s: 16, j: "MAUT-142" },
          { n: "CRO Optimizations", s: 16, j: "MAUT-104" },
          { n: "Meta Reporting", s: 15.5, j: "MAUT-42" },
          { n: "Reporting & Performance Monitoring (Lifecycle)", s: 15.5 },
          { n: "Snowflake Marketing Alerts", s: 15.5 },
          { n: "Channel Attribution Suspect Records Automation", s: 15.5 },
          { n: "AceIQ: Organic Social Reporting", s: 14.5, j: "MAUT-137" },
          { n: "Account Optimization / SQR Helper", s: 14, j: "MAUT-54" },
          { n: "Review & Sentiment Tracker", s: 14, j: "MAUT-144" },
          { n: "Content Duplication Alert System", s: 13.5, j: "MAUT-8" },
          { n: "Automate DMCA Takedown Process", s: 13.5, j: "MAUT-1" },
          { n: "New Lifecycle Dashboard", s: 7, j: "MAUT-147" },
        ],
      },
      {
        n: "CL: AceIQ Competitive Intelligence", imp: "High",
        p: "Monitors competitor activity — pricing changes, press mentions, brand mentions, product updates, state-by-state market entry, search ranking shifts, and review sentiment. Includes SERP extraction, monthly scheduling, and insurance-specific price scanning.",
        q: "Q2 2026", cap: "Peggy (Ellen)",
        i: [
          { n: "Competitor Price Change Automation", s: 14.5, j: "MAUT-135" },
          { n: "Competitor Press Mention Automation", s: 14, j: "MAUT-143" },
          { n: "Competitor Mention Tracking Automation", s: 14, j: "MAUT-116" },
          { n: "Insurance Competitor Price Change Scanner", s: 14 },
          { n: "Competitor Analysis Automation by State", s: 14, j: "MAUT-98" },
          { n: "Competitor Search Results Extraction Workflow", s: 14, j: "MAUT-119" },
          { n: "Configure Monthly Content Scheduling", s: 14, j: "MAUT-122" },
          { n: "Testing & QA - Competitor Tracking", s: 14, j: "MAUT-123", f: "MOVED from QA Pipeline" },
          { n: "Document SOP & Training", s: 14, j: "MAUT-124" },
          { n: "Define Output & Reporting Format", s: 14, j: "MAUT-121" },
        ],
      },
    ],
  },
  {
    t: "B2B & Partner Growth",
    d: "Acquire, onboard, and grow B2B and affiliate partners",
    c: "#ea580c",
    s: [
      {
        n: "Partner Acquisition Pipeline", r: true, imp: "High",
        p: "Automates top-of-funnel B2B — lead scraping and enrichment via Clay/Open Mart, automated prospecting sequences, email warm-up and rotation, and inbound lead routing.",
        q: "Q2 2026", cap: "Danny",
        i: [
          { n: "Inbound Lead Generation & Sales Flow", s: 13.5 },
          { n: "Lead Scraping Enrichment & Automation", s: 12.5 },
        ],
      },
      {
        n: "Partner Onboarding & Activation", r: true, imp: "Medium",
        p: "Standardizes the partner journey from signup through first share. AI classification routes high-value accounts to AM-assisted onboarding, everyone else to self-serve. Includes activation state management, private webinar enrollment, and human escalation triggers.",
        q: "Q2 2026", cap: "Marcela",
        i: [
          { n: "Activation Orchestration Layer w/ AI Classification", s: 22 },
          { n: "Private Webinar & Live CE Enrollment Flow", s: 21.5 },
          { n: "Self-Serve Affiliate Onboarding", s: 15 },
        ],
      },
      {
        n: "Affiliate Lead Data Engine", r: true, imp: "Medium",
        p: "Consolidates BAM, TUNE, Smart Setter, and Groupon lead exports into a unified pipeline. Includes TX geographic segmentation, daily Groupon processing, lead quality scoring, validated export/upload workflows, and full documentation.",
        q: "Q3 2026", cap: "Ellen",
        i: [
          { n: "Smart Setter Leads Export", s: 19, j: "MAUT-59" },
          { n: "Texas Data Separation by Town/County", s: 18.5, j: "MAUT-108" },
          { n: "Automate BAM Lead Workflows in n8n", s: 18.5, j: "MAUT-160" },
          { n: "Automate Daily Groupon Redemptions", s: 17, j: "MAUT-161" },
          { n: "Define Lead Quality Ranking & Scoring", s: 14, j: "MAUT-112" },
          { n: "Test & Validate Export/Upload Workflow", s: 13.5, j: "MAUT-113" },
          { n: "BAM Leads Export", s: 12.5, j: "MAUT-60" },
          { n: "Automate Upload to Google Drive Folders", s: 12.5, j: "MAUT-110" },
          { n: "Document BAM Leads Export Requirements", s: 10.5, j: "MAUT-109" },
          { n: "Documentation for Automated BAM Export", s: 10.5, j: "MAUT-114" },
        ],
      },
      {
        n: "Partner Lifecycle CRM Automation", r: true, imp: "Medium",
        p: "Keeps HubSpot partner records enriched, scored, and segmented with real-time TUNE/PBI performance data. Automates reactivation sequences, partner content audits, ranking logic, lead scoring/routing, and HubSpot API integration.",
        q: "Q2-Q3 2026", cap: "Marcela",
        i: [
          { n: "Lead Scoring Routing & Sales Intelligence", s: 20.5 },
          { n: "Affiliate Partner Reactivation Sequences", s: 20 },
          { n: "Monthly Partner Content Audit Automation", s: 19, j: "MAUT-46", f: "MOVED from Lead Data Engine" },
          { n: "Affiliate Partner Data (TUNE/PBI) to HubSpot", s: 17 },
          { n: "Implement Partner Ranking Logic", s: 15, j: "MAUT-120" },
          { n: "HubSpot API Integration", s: 14.5, j: "MAUT-115" },
          { n: "HubSpot Data Export Automation Script", s: 10.5, j: "MAUT-111" },
        ],
      },
      {
        n: "B2B Revenue Intelligence", imp: "Medium",
        p: "Automates B2B deal financials — pricing tier calculation, commission modeling, voucher portal with tiered access, a unified pricing/earnings calculator, and collateral fulfillment.",
        q: "Q3 2026", cap: "Ellen",
        i: [
          { n: "Automated Pricing & Commission Calculator", s: 18 },
          { n: "Voucher Portal Tiering", s: 16.5 },
          { n: "Collateral Fulfillment Process", s: 13.5 },
        ],
      },
    ],
  },
  {
    t: "Platform & Engineering Velocity",
    d: "Reduce engineering toil and speed up dev cycles",
    c: "#6366f1",
    s: [
      {
        n: "Developer Workflow Automation", imp: "Medium",
        p: "Automates engineering mechanics — JIRA-to-branch-to-PR via Claude Code, bug enrichment on merge, IDS migration, Jellyfish replacement, Tanstack modernization, Neon+Railway cleanup, Flutter exploration, and DNG monorepo consolidation.",
        q: "Q1-Q2 2026", cap: "Nat",
        i: [
          { n: "n8n Platform Evaluation", s: 20, j: "MAUT-180" },
          { n: "IDS Migration", s: 20, j: "ENGM-51" },
          { n: "Pull JIRA Ticket - Create Branch - Build Code - Push PR", s: 20, j: "ENGM-69" },
          { n: "Internally Replace Jellyfish by June", s: 20, j: "ENGM-66" },
          { n: "Update Bug Impact/Reason on Ticket Merge", s: 19, j: "ENGM-71" },
          { n: "PrepAgent Migration", s: 19 },
          { n: "Create Endpoints (Test Results / Open Targets)", s: 19 },
          { n: "Upgrade WEB to Tanstack Query", s: 19, j: "ENGM-37" },
          { n: "Cleanup Neon + Railway Stack", s: 18, j: "ENGM-42" },
          { n: "Experimental: Rebuild Learning App in Flutter", s: 18, j: "ENGM-76" },
          { n: "MonoRepo for All DNGs", s: 18, j: "ENGM-88" },
        ],
      },
      {
        n: "Platform Config & Feature Flag Mgmt", imp: "Medium",
        p: "Automates platform configuration — feature flag creation in Amplitude, per-page cache invalidation, Redis caching, DOM access for CRO, Bifrost link/user gen, Craft feature flags for Vision, and API key management in Jarvis.",
        q: "Q2-Q3 2026", cap: "Nat",
        i: [
          { n: "Per Page Invalidation", s: 18, j: "ENGM-49" },
          { n: "Redis Caching Layer for Craft", s: 18, j: "ENGM-56" },
          { n: "Access DOM for CRO Auto-Generate Test Code", s: 18 },
          { n: "Automate Feature Flag Creation", s: 18, j: "ENGM-41" },
          { n: "Craft Managed Feature Flags for Vision", s: 17.5, j: "ENGM-46" },
          { n: "Automate Bifrost Links + User Gen", s: 17.5, j: "ENGM-55" },
          { n: "Add API Keys with Permissions to Jarvis", s: 17.5, j: "ENGM-59" },
        ],
      },
      {
        n: "Design-to-Dev Handoff Automation", imp: "",
        p: "Packages design assets, specs, redlines, and review sign-offs from Figma into standardized handoff artifacts. Includes automated design review comparing builds to Figma frames.",
        q: "Later", cap: "Nat",
        i: [
          { n: "Design Handoff Package Generator", s: 22 },
          { n: "Design Reviews Automation", s: 21 },
        ],
      },
    ],
  },
  {
    t: "Data & Analytics Ops",
    d: "Reliable data pipelines, reporting, and data quality",
    c: "#0891b2",
    s: [
      {
        n: "Data Pipeline Reliability", imp: "Medium",
        p: "Monitors Snowflake/Matillion for failures, delays, and upstream errors. Auto-posts status to Slack, triggers downstream refreshes. Includes Matillion optimization via Claude Code, Maia AI agent, and Data Engineering agent.",
        q: "TBD", cap: "Ellen/Carlos",
        i: [
          { n: "Downstream DBT/PBI Environment Manual Refreshes", s: 17 },
          { n: "Matillion Pipeline / Claude Code", s: 17 },
          { n: "Automate Manual Groupon Data Refresh", s: 16.5 },
          { n: "Matillion Maia AI Agent", s: 16 },
          { n: "Overnight Refresh Database Delays", s: 16 },
          { n: "Pipeline Issues Monitoring (n8n + Slack)", s: 16 },
          { n: "Data Engineering Agent", s: 16 },
        ],
      },
      {
        n: "BI & Reporting Automation", imp: "Med-High",
        p: "Automates the reporting layer — dashboard refreshes, Optimizely ingestion, BI-as-Code/GenBI prototyping, AI-enabled pacing insights, FP&A agent in Snowflake Intelligence, and analytics gap identification.",
        q: "In progress", cap: "Ellen",
        i: [
          { n: "Identifying Analytics Gaps in User Flows", s: 17, j: "ENGM-65" },
          { n: "Get Reports from Optimizely Analytics Dashboard", s: 17 },
          { n: "BI-as-Code & GenBI Exploration", s: 17 },
          { n: "AI-Enabled Pacing Insights & Automation", s: 17 },
          { n: "FP&A Agent - Snowflake Intelligence", s: 17 },
        ],
      },
      {
        n: "Data Quality & Taxonomy Monitoring", imp: "Low",
        p: "Identifies taxonomy gaps, misclassified attribution, and schema inconsistencies. Includes Snowflake DBA role/permissions audit.",
        q: "Q2-Q4 2026", cap: "Ellen",
        i: [
          { n: "Data Quality & Taxonomy Coverage Monitoring", s: 16 },
          { n: "Snowflake DBA Role/Permissions Audit and Strategy", s: 16 },
        ],
      },
      {
        n: "Revenue Accounting Automation", imp: "Low",
        p: "Automates GAAP journal entries for all payment processors via DBT. Phase 1: core entries + PBI review + NetSuite export. Phase 2: Stripe fees, disputes, DIT. Eliminates 40-48 hrs of monthly manual close work.",
        q: "TBD", cap: "Ellen/Finance",
        i: [
          { n: "Monthly Merchant Fee Analysis Automation", s: 16, f: "Complete" },
          { n: "GAAP-Basis to MGMT-Basis Revenue Accounting", s: 16 },
          { n: "Revenue Accounting Automation Phase 1 (GAAP Journal Entries)", s: 16 },
          { n: "Revenue Automation Phase 2 - Stripe Fees Disputes & DIT", s: 16 },
        ],
      },
    ],
  },
  {
    t: "Org Operating System",
    d: "Org-wide planning, reporting, and operational infrastructure",
    c: "#be185d",
    s: [
      {
        n: "Meeting Intelligence", imp: "",
        p: "Ingests meeting notes and auto-generates scoped Jira tickets, Slack summaries, action items, and standardized ticket comments.",
        q: "TBD", cap: "TBD",
        i: [
          { n: "Use Meeting Notes to Autogenerate CRO/EPS/DESN Tickets", s: 17 },
          { n: "Create Jira Tickets from CRO Ideas with Targeting", s: 17 },
          { n: "Autopopulate Slack Channels with Meeting Notes/Actions", s: 17 },
          { n: "Automate Standardized Ticket Comments for PBI License", s: 17 },
        ],
      },
      {
        n: "OKR & Planning Automation", imp: "Medium",
        p: "Consolidates quarterly planning inputs, OKR updates, and automation progress into auto-distributed reports. Includes n8n update workflows, planning doc consolidation, 2026 company planning features, and a self-serve automation AI agent.",
        q: "Q1-Q3 2026", cap: "Ellen",
        i: [
          { n: "Build OKR & Weekly Automation Update WF", s: 17, j: "MAUT-189" },
          { n: "Self-Serve Automation AI Agent", s: 17 },
          { n: "Quarterly Planning Doc Consolidation/Automation", s: 17 },
          { n: "2026 Company Planning (Resourcing + Roadmapping + Scoring)", s: 17 },
        ],
      },
      {
        n: "Cross-Functional Reporting", imp: "Medium",
        p: "Pulls pacing metrics, KPIs, projections, and non-comp OpEx data into formatted executive reports. Includes weekly readout automation, contract-to-forecast reconciliation, and BI adoption tracking.",
        q: "In progress", cap: "Ellen/Lauren",
        i: [
          { n: "Contract to Forecast Reconciliation", s: 17.5 },
          { n: "BI 101 Course Completion - Auto Reminder Email", s: 17.5 },
          { n: "Weekly Executive Readout Automation", s: 17 },
        ],
      },
      {
        n: "Non-API External Data Flows", imp: "High",
        p: "Scrapes and ingests high-volume external data with guardrails before Snowflake. Foundation for Market Signal Intelligence, Regulatory Mapper, and Competitor Intelligence.",
        q: "TBD", cap: "Ellen",
        i: [],
      },
      {
        n: "Unified Tool Registry", imp: "Med-High",
        p: "Centralized repos for all Railway, Neon, and n8n apps — findable, searchable, maintainable. Stores tools plus owners plus active status.",
        q: "Q2 2026", cap: "Nat",
        i: [],
      },
    ],
  },
];
