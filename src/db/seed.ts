import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.development.local' });

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const sql = neon(DATABASE_URL);

const EFFORT_MAP: Record<string, number> = { XS: 0.5, S: 1, M: 2, L: 4, XL: 6 };

function score(bv: number, r: number, u: number, effort: string) {
  const impact = Math.round(((bv + r + u) / 3) * 10) / 10;
  const ew = (EFFORT_MAP as Record<string, number | undefined>)[effort] ?? 2;
  const priority = Math.round((impact / ew) * 100) / 100;
  return { impact: String(impact), effortWeeks: String(ew), priority: String(priority) };
}

async function seed() {
  console.info('Seeding master projects...');

  // Projects
  const projects = [
    {
      id: 'aceable-ids', name: 'Design Intelligence System (DIS)', color: '#7c3aed',
      description: 'Internal DAM and marketing intelligence hub for paid media creatives. Consolidates ad performance data from Meta, TikTok, Google, Microsoft, MNTN, and Sprout into a single dashboard with automated daily ingestion.',
      repoUrl: 'https://github.com/aceable-ai/Design-Intelligence-System',
      stack: 'Next.js 14, Prisma, Neon, S3, Clerk, Railway',
      status: 'active', users: 'Paid media team (daily), broader marketing (weekly)',
      phases: JSON.stringify([
        { name: 'MVP — Core Dashboard', description: 'Meta Ads, Sprout, admin console, Analysis Lab', status: 'done' },
        { name: 'Multi-Platform Intelligence', description: 'TikTok, Google, Microsoft, MNTN ingestion + cross-platform views', status: 'in-progress' },
        { name: 'Creative Intelligence', description: 'Asset library, performance analysis, automated recommendations', status: 'planned' },
        { name: 'Automation & Alerts', description: 'Anomaly detection, Slack alerts, budget pacing, scheduled reports', status: 'planned' },
      ]),
    },
    {
      id: 'promo-hub', name: 'Promotional Automation Hub', color: '#ea580c',
      description: 'Migrating the PMM promotional automation workflow from Airtable to a real database with proper API. Two portals: PMM Promo Tracking for brief submission/review, and Asset Pickup Portal for channel specialists.',
      repoUrl: 'https://github.com/aceable-ai/promotional-automation-hub',
      stack: 'Next.js 15, Drizzle, Neon, n8n, Railway, Tailwind v4',
      status: 'active', users: 'PMMs (daily), channel specialists (weekly)',
      phases: JSON.stringify([
        { name: 'MVP — Airtable Migration', description: 'DB schema, CSV import, PMM portal, Asset Pickup Portal, n8n webhooks', status: 'in-progress' },
        { name: 'Workflow Automation', description: 'Full n8n migration, task status UI, historical data import', status: 'planned' },
        { name: 'Reporting & Analytics', description: 'Launch performance dashboard, time-to-complete metrics, bottleneck ID', status: 'planned' },
      ]),
    },
    {
      id: 'iterable-email', name: 'Iterable Email Creator', color: '#0891b2',
      description: 'Multi-brand email template system with Iterable push flow. Creates branded email campaigns across Aceable verticals (RE, INS, MTG, DRV-IDS, DRV-DEC, DRV-ACE) with live preview and direct Iterable API integration.',
      repoUrl: 'https://github.com/aceable-ai/iterable-email-creator',
      stack: 'Next.js, Iterable API, Airtable, Figma integration',
      status: 'active', users: 'Lifecycle marketing team (weekly)',
      phases: JSON.stringify([
        { name: 'MVP — Email Builder', description: 'Live editor, preview, multi-brand templates, Iterable push', status: 'done' },
        { name: 'Asset Integration', description: 'Figma image picker, upload from computer, copy queue', status: 'done' },
        { name: 'Template Library', description: 'Saved templates, version history, A/B variant support', status: 'planned' },
      ]),
    },
    {
      id: 'desn-campaign', name: 'DESN Campaign Builder', color: '#dc2626',
      description: 'Campaign asset builder with Figma integration. Extracts copy and images from Figma designs and assembles them into campaign-ready assets.',
      repoUrl: 'https://github.com/aceable-ai/desn-campaign-builder',
      stack: 'Next.js, Figma API integration',
      status: 'active', users: 'Design + marketing team (weekly)',
      phases: JSON.stringify([
        { name: 'MVP — Figma Extraction', description: 'Image export, copy extraction, gallery with cloud uploads', status: 'done' },
        { name: 'Email Composition', description: 'Hero/body section integration, secondary image carousel', status: 'in-progress' },
        { name: 'Multi-Channel Output', description: 'Export to social, display, and landing page formats', status: 'planned' },
      ]),
    },
    {
      id: 'promo-tracker', name: 'Promo Tracker', color: '#6b7280',
      description: 'Promotional tracking and analytics. Scaffolded but not yet actively developed.',
      repoUrl: 'https://github.com/aceable-ai/promotional-automation-hub',
      stack: 'Next.js 15, Drizzle, Neon',
      status: 'stalled', users: 'TBD',
      phases: JSON.stringify([
        { name: 'MVP — Promo Tracking', description: 'Basic promotional performance tracking dashboard', status: 'planned' },
      ]),
    },
  ];

  for (const p of projects) {
    await sql`
      INSERT INTO master_projects (id, name, description, repo_url, stack, status, users, color, phases)
      VALUES (${p.id}, ${p.name}, ${p.description}, ${p.repoUrl}, ${p.stack}, ${p.status}, ${p.users}, ${p.color}, ${p.phases}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, repo_url = EXCLUDED.repo_url,
        stack = EXCLUDED.stack, status = EXCLUDED.status, users = EXCLUDED.users, color = EXCLUDED.color,
        phases = EXCLUDED.phases, updated_at = NOW()
    `;
  }
  console.info(`  Upserted ${projects.length} projects`);

  // Backlog items
  console.info('Seeding backlog items...');

  const items = [
    // DIS
    { id: 'IDS-001', projectId: 'aceable-ids', title: 'TikTok Ads ingestion pipeline', bv: 4, r: 4, u: 4, effort: 'M' },
    { id: 'IDS-002', projectId: 'aceable-ids', title: 'Google Ads ingestion pipeline', bv: 5, r: 4, u: 4, effort: 'M' },
    { id: 'IDS-003', projectId: 'aceable-ids', title: 'Microsoft Ads ingestion pipeline', bv: 3, r: 3, u: 3, effort: 'M' },
    { id: 'IDS-004', projectId: 'aceable-ids', title: 'MNTN ingestion pipeline', bv: 3, r: 2, u: 2, effort: 'S' },
    { id: 'IDS-005', projectId: 'aceable-ids', title: 'Creative asset library with S3 tagging', bv: 4, r: 4, u: 3, effort: 'L' },
    { id: 'IDS-006', projectId: 'aceable-ids', title: 'Slack alerts for spend pacing anomalies', bv: 4, r: 4, u: 4, effort: 'S' },
    { id: 'IDS-007', projectId: 'aceable-ids', title: 'Automated weekly report PDF export', bv: 3, r: 4, u: 3, effort: 'M' },
    { id: 'IDS-008', projectId: 'aceable-ids', title: 'Cross-platform creative comparison view', bv: 4, r: 3, u: 2, effort: 'L' },
    { id: 'IDS-009', projectId: 'aceable-ids', title: 'Search Query Analyzer file upload fix', bv: 3, r: 3, u: 3, effort: 'XS' },
    { id: 'IDS-010', projectId: 'aceable-ids', title: 'Paid search pacing dashboard', bv: 4, r: 3, u: 4, effort: 'M' },

    // Promo Hub
    { id: 'PAH-001', projectId: 'promo-hub', title: 'Fix DATABASE_URL in Railway deployment', bv: 5, r: 5, u: 5, effort: 'XS' },
    { id: 'PAH-002', projectId: 'promo-hub', title: 'Migrate n8n nodes from Airtable to Postgres', bv: 5, r: 4, u: 4, effort: 'M' },
    { id: 'PAH-003', projectId: 'promo-hub', title: 'Task status UI (Done/Blocked states)', bv: 4, r: 4, u: 4, effort: 'S' },
    { id: 'PAH-004', projectId: 'promo-hub', title: 'Historical launch data import from Airtable', bv: 4, r: 3, u: 3, effort: 'M' },
    { id: 'PAH-005', projectId: 'promo-hub', title: 'Promo calendar visualization', bv: 3, r: 4, u: 3, effort: 'M' },
    { id: 'PAH-006', projectId: 'promo-hub', title: 'Automated assignment routing via n8n', bv: 3, r: 3, u: 2, effort: 'M' },

    // Iterable Email
    { id: 'IEC-001', projectId: 'iterable-email', title: 'Saved email template library', bv: 4, r: 3, u: 3, effort: 'M' },
    { id: 'IEC-002', projectId: 'iterable-email', title: 'A/B variant support for email campaigns', bv: 4, r: 3, u: 2, effort: 'L' },
    { id: 'IEC-003', projectId: 'iterable-email', title: 'Email performance tracking dashboard', bv: 3, r: 3, u: 2, effort: 'M' },
    { id: 'IEC-004', projectId: 'iterable-email', title: 'Bulk email campaign creation', bv: 3, r: 2, u: 2, effort: 'M' },

    // DESN Campaign Builder
    { id: 'DCB-001', projectId: 'desn-campaign', title: 'Multi-channel export (social, display, landing page)', bv: 4, r: 3, u: 3, effort: 'L' },
    { id: 'DCB-002', projectId: 'desn-campaign', title: 'Template presets for common campaign types', bv: 3, r: 3, u: 2, effort: 'M' },
    { id: 'DCB-003', projectId: 'desn-campaign', title: 'Version history for campaign assets', bv: 2, r: 2, u: 1, effort: 'M' },
  ];

  for (const item of items) {
    const { impact, effortWeeks, priority } = score(item.bv, item.r, item.u, item.effort);
    await sql`
      INSERT INTO backlog_items (id, project_id, title, business_value, reach, urgency, impact, effort, effort_weeks, priority)
      VALUES (${item.id}, ${item.projectId}, ${item.title}, ${item.bv}, ${item.r}, ${item.u}, ${impact}, ${item.effort}, ${effortWeeks}, ${priority})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, business_value = EXCLUDED.business_value, reach = EXCLUDED.reach,
        urgency = EXCLUDED.urgency, impact = EXCLUDED.impact, effort = EXCLUDED.effort,
        effort_weeks = EXCLUDED.effort_weeks, priority = EXCLUDED.priority, updated_at = NOW()
    `;
  }
  console.info(`  Upserted ${items.length} backlog items`);

  // Current cycle
  console.info('Seeding current cycle...');
  await sql`
    INSERT INTO cycles (id, name, start_date, end_date, goal, budget_weeks, status)
    VALUES ('cycle-01', 'Q2C1 — DIS Multi-Platform + Promo Hub Launch', '2026-04-16', '2026-05-27', 'Ship DIS multi-platform ingestion and get Promo Hub live on Railway', '4.5', 'planning')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
      goal = EXCLUDED.goal, budget_weeks = EXCLUDED.budget_weeks
  `;
  console.info('  Upserted cycle-01');

  console.info('Seed complete!');
}

seed().catch((err: unknown) => { console.error('Seed failed:', err); process.exit(1); });
