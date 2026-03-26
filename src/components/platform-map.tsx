'use client';

import { useState, useMemo } from 'react';
import { PLATFORMS, DB_STYLES, FILTERS } from '@/lib/platform-data';

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
