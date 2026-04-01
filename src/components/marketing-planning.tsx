'use client';

import { useState, useRef } from 'react';

const MKTG_PRI: Record<string, { bg: string; text: string; border: string }> = {
  'Must-Have': { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  'High':      { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  'Medium':    { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
};

const GTM_COLOR = '#2563eb';
const SEO_COLOR = '#7c3aed';

interface Feature {
  n: string;
  wk: string;
  pri: keyof typeof MKTG_PRI;
  dep: string;
}

interface Category {
  cat: string;
  features: Feature[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_GTM: Category[] = [
  {
    cat: 'Unblock App',
    features: [
      { n: 'Fix DATABASE_URL in Railway', wk: '1', pri: 'Must-Have', dep: 'Neon connection string' },
      { n: 'Update n8n workflow nodes — Airtable to Postgres', wk: '1-2', pri: 'Must-Have', dep: 'DATABASE_URL fix' },
      { n: 'Remap n8n field names to Drizzle schema columns', wk: '1-2', pri: 'Must-Have', dep: 'DATABASE_URL fix' },
      { n: 'Ship task status UI (mark Done / Blocked)', wk: '1-2', pri: 'Must-Have', dep: 'DATABASE_URL fix' },
      { n: 'Historical launch import — populate existing data', wk: '2', pri: 'Must-Have', dep: 'DATABASE_URL fix' },
    ],
  },
  {
    cat: 'Vertical Expansion',
    features: [
      { n: 'DRV ACE — competitors data', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV ACE — state regulatory rules', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV ACE — personas', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV ACE — products + brand data', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV IDS — competitors data', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV IDS — state regulatory rules', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV IDS — personas', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV IDS — products + brand data', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV DEC — competitors data', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV DEC — state regulatory rules', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV DEC — personas', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'DRV DEC — products + brand data', wk: '2-3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'RE (AceableAgent) — competitors data', wk: '3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'RE (AceableAgent) — state requirements', wk: '3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'RE (AceableAgent) — personas', wk: '3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'RE (AceableAgent) — products', wk: '3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'MTG — competitors data', wk: '3-4', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'MTG — regulatory landscape', wk: '3-4', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'MTG — personas', wk: '3-4', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'MTG — products', wk: '3-4', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'Vertical-aware n8n workflow logic', wk: '3-4', pri: 'Must-Have', dep: 'All vertical data seeded' },
    ],
  },
  {
    cat: 'New Launch Types',
    features: [
      { n: 'Launch type selector on intake form', wk: '3', pri: 'Must-Have', dep: 'Database connected' },
      { n: 'Feature/Upsell task template (~25-35 tasks)', wk: '3-4', pri: 'Must-Have', dep: 'Launch type selector' },
      { n: 'Feature/Upsell one-pager structure (modified sections)', wk: '3-4', pri: 'Must-Have', dep: 'Launch type selector' },
      { n: 'Feature/Upsell channel emphasis config (lifecycle / in-app / retargeting)', wk: '4', pri: 'High', dep: 'Feature/Upsell template' },
      { n: 'State-by-state rollout support (repeatable per-state launches)', wk: '4', pri: 'High', dep: 'Feature/Upsell template' },
      { n: 'Content Launch task template (create → review → design → distribute)', wk: '4-5', pri: 'Must-Have', dep: 'Launch type selector' },
      { n: 'Content Launch → SEO Content Factory trigger (API/webhook)', wk: '5-6', pri: 'Must-Have', dep: 'Content Launch template + SEO Content Factory' },
      { n: 'Batch progress tracking (3/21 → 12/21 → 21/21)', wk: '5-6', pri: 'Must-Have', dep: 'Content Launch template' },
    ],
  },
  {
    cat: 'Feature Roadmap',
    features: [
      { n: 'Gantt chart — visual timeline per launch with dependencies', wk: '3-4', pri: 'High', dep: 'Task status UI' },
      { n: 'Slack notifications — auto-notify assignees when tasks unlock', wk: '4', pri: 'High', dep: 'Task status UI + dependencies' },
      { n: 'Asset Hub + DIS integration — GTM outputs route through DIS', wk: '5-6', pri: 'High', dep: 'DIS live' },
      { n: 'Email creator → asset output (n8n generates → writes as asset record)', wk: '5', pri: 'High', dep: 'Asset Hub' },
      { n: 'Review queue — status-tracked interface replacing Trello', wk: '5', pri: 'High', dep: 'Task status UI' },
    ],
  },
  {
    cat: 'DIS Integration',
    features: [
      { n: 'Query DIS for existing assets before triggering new design work', wk: '5-6', pri: 'High', dep: 'DIS live + Asset Hub' },
      { n: 'Trigger design request as GTM task when no asset exists in DIS', wk: '5-6', pri: 'High', dep: 'DIS live + Asset Hub' },
      { n: 'Visual needs routing for all launch types (course / feature / content / promo)', wk: '6', pri: 'High', dep: 'All launch types + DIS integration' },
    ],
  },
];

const INITIAL_SEO: Category[] = [
  {
    cat: 'Content Pipeline',
    features: [
      { n: 'Research Content Generator — batch topic sourcing (Semrush + competitor gaps + LLM visibility)', wk: '5-6', pri: 'Must-Have', dep: 'None' },
      { n: 'Batch generation from GTM requests (e.g. 21 foundational pieces)', wk: '7-8', pri: 'Must-Have', dep: 'Research Content Generator + GTM integration' },
      { n: 'Review queue — status-tracked interface (Generated → In Review → Approved → Published)', wk: '6-7', pri: 'Must-Have', dep: 'Research Content Generator' },
      { n: 'Review queue → GTM status sync (webhook updates task count)', wk: '7-8', pri: 'Must-Have', dep: 'Review queue + GTM integration' },
      { n: 'Schema Generation — Research pages', wk: '7-8', pri: 'High', dep: 'Research Content Generator' },
      { n: 'Schema Generation — Product pages', wk: '7-8', pri: 'High', dep: 'None' },
      { n: 'Schema Bot — automated structured data across all content types', wk: '8-9', pri: 'High', dep: 'Schema Generation' },
      { n: 'Trending signal detection (Google Trends / social / news)', wk: 'Future', pri: 'Medium', dep: 'Research Content Generator' },
    ],
  },
  {
    cat: 'CMS Publishing',
    features: [
      { n: 'Auto Publish Rewrites to Craft CMS', wk: '5-6', pri: 'Must-Have', dep: 'Craft CMS access' },
      { n: 'Net New Auto Publish to Craft (Feed Me endpoint)', wk: '5-6', pri: 'Must-Have', dep: 'Craft CMS + Feed Me plugin' },
      { n: 'Automated Content Creation Pipeline (end-to-end generation → CMS)', wk: '7-8', pri: 'Must-Have', dep: 'Auto Publish + Research Content Generator' },
      { n: 'Automated Content Updates (keep published content fresh)', wk: '8-9', pri: 'High', dep: 'Auto Publish' },
      { n: 'DEC Full Content Automation (DriversEd.com brand-specific)', wk: '9-10', pri: 'High', dep: 'Automated Content Creation Pipeline' },
    ],
  },
  {
    cat: 'Cross-Format',
    features: [
      { n: 'Blog-to-Video Automation', wk: '8-9', pri: 'Medium', dep: 'Research Content Generator' },
      { n: 'YouTube Video Brief Generator', wk: '8-9', pri: 'Medium', dep: 'Research Content Generator' },
      { n: 'Custom Interactive Widgets (replace Common Ninja)', wk: '9-10', pri: 'Medium', dep: 'None' },
      { n: 'LinkedIn Content & Outreach Sequences', wk: '10-11', pri: 'Medium', dep: 'Research Content Generator' },
      { n: 'Multi-channel output — briefs to email / social / B2B / paid / LinkedIn', wk: '10-12', pri: 'High', dep: 'Research Content Generator + review queue' },
    ],
  },
  {
    cat: 'System Integration',
    features: [
      { n: 'GTM → Content Factory API (receive batch requests with launch context)', wk: '7-8', pri: 'Must-Have', dep: 'Research Content Generator + GTM Content Launch template' },
      { n: 'Content Factory → GTM webhook (status updates on each piece)', wk: '7-8', pri: 'Must-Have', dep: 'Review queue + GTM integration' },
      { n: 'WF3 Complex API Connections (system-to-system communication layer)', wk: '8-9', pri: 'High', dep: 'GTM + DIS integrations' },
    ],
  },
  {
    cat: 'DIS Integration',
    features: [
      { n: 'Query DIS for existing visuals before publishing', wk: '8-9', pri: 'High', dep: 'DIS live' },
      { n: 'Trigger DIS design request when no visual exists', wk: '8-9', pri: 'High', dep: 'DIS live + GTM task creation' },
      { n: 'Content + visual package complete before publish', wk: '9-10', pri: 'High', dep: 'DIS query + design request flow' },
    ],
  },
];

// ── Components ────────────────────────────────────────────────────────────────

function FeatureRow({
  feat,
  i,
  color,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  feat: Feature;
  i: number;
  color: string;
  dragOver: number | null;
  onDragStart: (i: number) => void;
  onDragOver: (i: number) => void;
  onDrop: (i: number) => void;
  onDragEnd: () => void;
}) {
  const pc = MKTG_PRI[feat.pri];
  const isOver = dragOver === i;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(i)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(i); }}
      onDrop={() => onDrop(i)}
      onDragEnd={onDragEnd}
      style={{
        padding: '7px 12px',
        borderLeft: isOver ? `3px solid ${color}` : '3px solid #e0e0e0',
        marginBottom: 3,
        background: isOver ? `${color}0D` : 'transparent',
        borderRadius: '0 6px 6px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'background 0.1s, border-color 0.1s',
      }}
    >
      <span style={{ fontSize: 13, color: '#ddd', flexShrink: 0, lineHeight: 1 }}>⠿</span>
      <span style={{ fontSize: 12, color: '#444', flex: 1, minWidth: 0 }}>{feat.n}</span>
      {pc && (
        <span
          style={{
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 4,
            background: pc.bg,
            color: pc.text,
            border: `1px solid ${pc.border}`,
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {feat.pri}
        </span>
      )}
      <span style={{ fontSize: 10, color: '#bbb', flexShrink: 0, whiteSpace: 'nowrap', minWidth: 36, textAlign: 'right' }}>
        Wk {feat.wk}
      </span>
    </div>
  );
}

function CategoryRow({
  catData,
  color,
  isOpen,
  setOpen,
  setFeatures,
}: {
  catData: Category;
  color: string;
  isOpen: boolean;
  setOpen: (val: string | null) => void;
  setFeatures: (features: Feature[]) => void;
}) {
  const dragSrc = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function handleDragStart(i: number) { dragSrc.current = i; }
  function handleDragOver(i: number) { setDragOver(i); }
  function handleDrop(i: number) {
    const from = dragSrc.current;
    if (from === null || from === i) { setDragOver(null); return; }
    const next = [...catData.features];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setFeatures(next);
    dragSrc.current = null;
    setDragOver(null);
  }
  function handleDragEnd() { dragSrc.current = null; setDragOver(null); }

  return (
    <div style={{ marginTop: 8 }}>
      <div
        onClick={() => setOpen(isOpen ? null : catData.cat)}
        style={{
          padding: '10px 12px',
          background: '#f9f9f9',
          borderRadius: 8,
          cursor: 'pointer',
          userSelect: 'none',
          border: '1px solid transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>{isOpen ? '▼' : '▶'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{catData.cat}</span>
          <span style={{ fontSize: 11, color: '#999' }}>({catData.features.length})</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#bbb', flexShrink: 0 }}>
            drag to reprioritize ↕
          </span>
        </div>
      </div>

      {isOpen && (
        <div style={{ marginLeft: 19, marginTop: 6 }}>
          {catData.features.map((feat, i) => (
            <FeatureRow
              key={i}
              feat={feat}
              i={i}
              color={color}
              dragOver={dragOver}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        padding: '6px 14px',
        marginTop: 8,
        borderLeft: `4px solid ${color}`,
        background: color + '10',
        borderRadius: 6,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MarketingPlanning() {
  const [gtm, setGtm] = useState<Category[]>(INITIAL_GTM);
  const [seo, setSeo] = useState<Category[]>(INITIAL_SEO);
  const [openCat, setOpenCat] = useState<string | null>(null);

  const gtmTotal = gtm.reduce((acc, c) => acc + c.features.length, 0);
  const seoTotal = seo.reduce((acc, c) => acc + c.features.length, 0);

  function setFeaturesFor(
    section: 'GTM' | 'SEO',
    cats: Category[],
    setCats: (c: Category[]) => void,
    catName: string,
    newFeatures: Feature[]
  ) {
    setCats(cats.map((c) => (c.cat === catName ? { ...c, features: newFeatures } : c)));
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: 960,
        margin: '0 auto',
        padding: 16,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111' }}>
          Marketing Q2 Planning
        </h2>
        <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>
          {gtm.length + seo.length} projects · {gtmTotal + seoTotal} features ·{' '}
          <span style={{ color: GTM_COLOR, fontWeight: 600 }}>GTM {gtmTotal}</span>
          {' · '}
          <span style={{ color: SEO_COLOR, fontWeight: 600 }}>SEO {seoTotal}</span>
        </p>
      </div>

      {/* Priority legend */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: '#aaa' }}>Priority:</span>
        {Object.entries(MKTG_PRI).map(([label, { bg, text, border }]) => (
          <span
            key={label}
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 4,
              background: bg,
              color: text,
              border: `1px solid ${border}`,
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* GTM section */}
      <SectionLabel label="GTM" color={GTM_COLOR} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
        {gtm.map((catData) => (
          <CategoryRow
            key={`GTM::${catData.cat}`}
            catData={catData}
            color={GTM_COLOR}
            isOpen={openCat === `GTM::${catData.cat}`}
            setOpen={(val) => setOpenCat(val ? `GTM::${val}` : null)}
            setFeatures={(nf) => setFeaturesFor('GTM', gtm, setGtm, catData.cat, nf)}
          />
        ))}
      </div>

      {/* SEO section */}
      <SectionLabel label="SEO Content Factory" color={SEO_COLOR} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {seo.map((catData) => (
          <CategoryRow
            key={`SEO::${catData.cat}`}
            catData={catData}
            color={SEO_COLOR}
            isOpen={openCat === `SEO::${catData.cat}`}
            setOpen={(val) => setOpenCat(val ? `SEO::${val}` : null)}
            setFeatures={(nf) => setFeaturesFor('SEO', seo, setSeo, catData.cat, nf)}
          />
        ))}
      </div>
    </div>
  );
}
