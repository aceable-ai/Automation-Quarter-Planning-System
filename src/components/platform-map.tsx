'use client';

import { useState, useMemo } from 'react';
import { PLATFORMS, DB_STYLES, FILTERS } from '@/lib/platform-data';

function LegendRow({ color, label, detail }: { color: string; label: string; detail: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        marginTop: 3, width: 12, height: 12, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      <div>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#1A1A18' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#6B6B67', marginLeft: 6 }}>{detail}</span>
      </div>
    </div>
  );
}

export default function PlatformMap() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    return PLATFORMS.filter((p) => {
      const matchesFilter =
        activeFilter === 'all' || p.name.includes(activeFilter);
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.user.toLowerCase().includes(q) ||
        p.dbs.some((d) => d.label.toLowerCase().includes(q)) ||
        p.pages.some((pg) => pg.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [search, activeFilter]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F7F7F5', minHeight: '100vh', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E5E4E0',
        padding: '28px 40px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A18', letterSpacing: '-0.3px' }}>
              Platform &amp; Output Map
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6B6B67', fontSize: 13 }}>
              {PLATFORMS.length} platforms · {PLATFORMS.reduce((s, p) => s + p.pages.length, 0)} outputs / pages
            </p>
          </div>
          <input
            type="search"
            placeholder="Search platforms, pages, or users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #DDDDD8',
              fontSize: 13,
              width: 280,
              background: '#FAFAF8',
              outline: 'none',
              color: '#1A1A18',
            }}
          />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: '5px 13px',
                borderRadius: 20,
                border: activeFilter === f.value ? '1.5px solid #1A1A18' : '1px solid #DDDDD8',
                background: activeFilter === f.value ? '#1A1A18' : '#fff',
                color: activeFilter === f.value ? '#fff' : '#444441',
                fontSize: 12,
                fontWeight: activeFilter === f.value ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '20px 40px 0' }}>
        <details style={{ background: '#fff', border: '1px solid #E5E4E0', borderRadius: 10, overflow: 'hidden' }}>
          <summary style={{
            padding: '12px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#1A1A18', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8,
            userSelect: 'none',
          }}>
            <span style={{ fontSize: 14 }}>📖</span> How to read this map
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9B9B97', fontWeight: 400 }}>click to expand</span>
          </summary>

          <div style={{ padding: '0 18px 20px', borderTop: '1px solid #F0EFEB' }}>
            {/* Purpose statement */}
            <p style={{ fontSize: 13, color: '#444441', margin: '16px 0 20px', lineHeight: 1.6, maxWidth: 700 }}>
              Each card represents a <strong>platform</strong> — a logical product or tool built for a specific team.
              The <strong>database chips</strong> show which underlying databases must be built or connected to make that platform work.
              The <strong>pages / outputs</strong> are the individual views, reports, or tools that live inside the platform.
            </p>

            {/* Annotated card anatomy */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

              {/* Mini mock card */}
              <div style={{
                background: '#FAFAF8', border: '1px solid #E5E4E0', borderRadius: 10,
                overflow: 'hidden', width: 260, flexShrink: 0, fontSize: 12,
              }}>
                <div style={{ borderLeft: '4px solid #378ADD', padding: '12px 14px 10px', borderBottom: '1px solid #F0EFEB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#378ADD', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: '#1A1A18', fontSize: 13 }}>Platform name</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B67', marginBottom: 8, paddingLeft: 15 }}>Who uses this platform</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingLeft: 15 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: '#E8F2FC', color: '#0C447C', border: '1px solid #A8CFF0' }}>DB required ①</span>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: '#EBF5E0', color: '#27500A', border: '1px solid #AADD80' }}>DB required ②</span>
                  </div>
                </div>
                <div style={{ padding: '10px 14px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#888884', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Pages / outputs</div>
                  {['Page or report name', 'Another view or tool', 'Another output'].map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#378ADD', opacity: 0.5, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: '#3A3A37', fontSize: 11.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Annotations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                <LegendRow color="#378ADD" label="Color stripe + dot" detail="Identifies the platform grouping — matches the filter buttons at the top" />
                <LegendRow color="#6B6B67" label="User audience" detail="The teams or roles who use this platform day-to-day" />
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    marginTop: 2, width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: 'linear-gradient(135deg, #E8F2FC 0%, #EBF5E0 100%)',
                    border: '1px solid #DDDDD8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>🗄️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A18', marginBottom: 2 }}>Database chips <span style={{ color: '#E04E1A', fontSize: 11, fontWeight: 600 }}>← key</span></div>
                    <div style={{ fontSize: 12, color: '#444441', lineHeight: 1.5, maxWidth: 380 }}>
                      These are the <strong>databases that must be built or connected</strong> to power this platform.
                      Each chip color = a different data domain. If a platform has 2 chips, it needs data from both sources to function.
                    </div>
                  </div>
                </div>
                <LegendRow color="#888884" label="Pages / outputs" detail="The individual views, dashboards, reports, or tools that the platform exposes to users" />
              </div>
            </div>

            {/* DB chip legend */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0EFEB' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888884', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Database types
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'DataMart / Power BI', cls: 'datamart' },
                  { label: 'Marketing intel', cls: 'marketing' },
                  { label: 'Market share intel', cls: 'marketshare' },
                  { label: 'Mongo', cls: 'mongo' },
                  { label: 'B2B intel', cls: 'b2b' },
                  { label: 'Design intel', cls: 'design' },
                  { label: 'Regulatory requirements', cls: 'regulatory' },
                  { label: 'Internal / no DB', cls: 'internal' },
                ].map(({ label, cls }) => {
                  const s = DB_STYLES[cls] ?? { bg: '#F2F2EE', color: '#444441', border: '#CCCCCC' };
                  return (
                    <span key={cls} style={{
                      padding: '4px 11px', borderRadius: 10, fontSize: 11.5, fontWeight: 500,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    }}>
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 20,
        padding: '28px 40px',
      }}>
        {filtered.length === 0 && (
          <p style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
            No platforms match your search.
          </p>
        )}
        {filtered.map((platform) => (
          <div
            key={platform.name}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E5E4E0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Card header */}
            <div style={{
              borderLeft: `4px solid ${platform.color}`,
              padding: '16px 18px 14px',
              borderBottom: '1px solid #F0EFEB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
                <span style={{
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: platform.color,
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A18', lineHeight: 1.3 }}>
                  {platform.name}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#6B6B67', marginBottom: 10, paddingLeft: 19 }}>
                {platform.user}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 19 }}>
                {platform.dbs.map((db) => {
                  const style = DB_STYLES[db.cls] ?? { bg: '#F2F2EE', color: '#444441', border: '#CCCCCC' };
                  return (
                    <span
                      key={db.label}
                      style={{
                        padding: '2px 9px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 500,
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      {db.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Pages list */}
            <div style={{ padding: '12px 18px 16px', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888884', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Pages / outputs ({platform.pages.length})
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {platform.pages.map((page) => {
                  const q = search.toLowerCase();
                  const highlight = q && page.toLowerCase().includes(q);
                  return (
                    <li key={page} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        width: 4, height: 4,
                        borderRadius: '50%',
                        background: platform.color,
                        flexShrink: 0,
                        opacity: 0.6,
                        display: 'inline-block',
                      }} />
                      <span style={{
                        fontSize: 12.5,
                        color: highlight ? '#1A1A18' : '#3A3A37',
                        fontWeight: highlight ? 600 : 400,
                        background: highlight ? `${platform.color}22` : 'transparent',
                        borderRadius: 3,
                        padding: highlight ? '0 3px' : 0,
                      }}>
                        {page}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
