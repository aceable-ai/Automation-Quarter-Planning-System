'use client';

import { useState, useEffect, useMemo } from 'react';
import { PLATFORMS, DB_STYLES } from '@/lib/platform-data';

const QUARTERS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', '2027+'];

const DB_LIST = [
  { cls: 'marketing',   label: 'Marketing intel',         exists: false },
  { cls: 'marketshare', label: 'Market share intel',      exists: false },
  { cls: 'b2b',         label: 'B2B intel',               exists: false },
  { cls: 'design',      label: 'Design intel',            exists: false },
  { cls: 'regulatory',  label: 'Regulatory requirements', exists: false },
  { cls: 'datamart',    label: 'DataMart / Power BI',     exists: true  },
  { cls: 'mongo',       label: 'Mongo',                   exists: true  },
  { cls: 'internal',    label: 'Internal / no DB',        exists: true  },
];

const unbuilt = DB_LIST.filter(d => !d.exists);
const built    = DB_LIST.filter(d => d.exists);

export default function DatabaseRoadmap() {
  const [planned, setPlanned] = useState<Record<string, string>>({});
  const [loaded,  setLoaded]  = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showBuilt, setShowBuilt] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aqps:db_planned');
      if (raw) setPlanned(JSON.parse(raw) as Record<string, string>);
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('aqps:db_planned', JSON.stringify(planned));
  }, [planned, loaded]);

  const depMap = useMemo(() => {
    const map: Record<string, typeof PLATFORMS> = {};
    for (const p of PLATFORMS) {
      for (const db of p.dbs) {
        if (!map[db.cls]) map[db.cls] = [];
        map[db.cls]!.push(p);
      }
    }
    return map;
  }, []);

  function toggleQuarter(cls: string, q: string) {
    setPlanned(prev => {
      if (prev[cls] === q) {
        return Object.fromEntries(Object.entries(prev).filter(([k]) => k !== cls));
      }
      return { ...prev, [cls]: q };
    });
  }

  const totalBlocked = new Set(
    unbuilt.flatMap(d => (depMap[d.cls] ?? []).map(p => p.name))
  ).size;
  const unscheduled = unbuilt.filter(d => !planned[d.cls]).length;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F7F7F5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E4E0', padding: '28px 40px 24px' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A18', letterSpacing: '-0.3px' }}>
          Database Build Roadmap
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6B6B67', fontSize: 13 }}>
          Click a quarter to schedule when each database will be built. Platforms listed below each row are blocked until that database exists.
        </p>
      </div>

      <div style={{ padding: '28px 40px' }}>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Databases to build', value: unbuilt.length,  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Platforms blocked',  value: totalBlocked,    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Not yet scheduled',  value: unscheduled,     color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: 10, padding: '14px 22px', minWidth: 140,
            }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Gantt table */}
        <div style={{ background: '#fff', border: '1px solid #E5E4E0', borderRadius: 12, overflow: 'hidden' }}>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(5, 1fr)', background: '#FAFAF8', borderBottom: '1px solid #E5E4E0' }}>
            <div style={{ padding: '10px 20px', fontSize: 11, fontWeight: 700, color: '#888884', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Database
            </div>
            {QUARTERS.map(q => (
              <div key={q} style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: '#888884', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', borderLeft: '1px solid #E5E4E0' }}>
                {q}
              </div>
            ))}
          </div>

          {/* Needs to be built label */}
          <div style={{ background: '#fff5f5', borderBottom: '1px solid #fecaca', padding: '8px 20px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Needs to be built — click a quarter to schedule
            </span>
          </div>

          {/* Unbuilt rows */}
          {unbuilt.map((db, idx) => {
            const s = DB_STYLES[db.cls] ?? { bg: '#F2F2EE', color: '#444441', border: '#CCCCCC' };
            const deps = depMap[db.cls] ?? [];
            const isExp = expanded === db.cls;
            const plannedQ = planned[db.cls];
            const isLast = idx === unbuilt.length - 1;

            return (
              <div key={db.cls} style={{ borderBottom: isLast && !showBuilt ? 'none' : '1px solid #F0EFEB' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(5, 1fr)', alignItems: 'stretch' }}>

                  {/* Info cell */}
                  <div
                    onClick={() => setExpanded(isExp ? null : db.cls)}
                    style={{ padding: '14px 20px', borderRight: '1px solid #F0EFEB', cursor: deps.length > 0 ? 'pointer' : 'default' }}
                  >
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 10,
                      fontSize: 11.5, fontWeight: 600, marginBottom: 6,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    }}>
                      {db.label}
                    </span>
                    <div style={{ fontSize: 11, fontWeight: 600, color: plannedQ ? '#16a34a' : '#dc2626' }}>
                      {plannedQ ? `Scheduled: ${plannedQ}` : 'Not scheduled'}
                    </div>
                    {deps.length > 0 && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
                        {deps.length} platform{deps.length !== 1 ? 's' : ''} blocked {isExp ? '▲' : '▼'}
                      </div>
                    )}
                  </div>

                  {/* Quarter cells */}
                  {QUARTERS.map(q => {
                    const isSel = plannedQ === q;
                    return (
                      <div
                        key={q}
                        onClick={() => toggleQuarter(db.cls, q)}
                        title={isSel ? `Click to unschedule` : `Schedule for ${q}`}
                        style={{
                          borderLeft: '1px solid #F0EFEB',
                          background: isSel ? s.bg : 'transparent',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          minHeight: 72,
                          transition: 'background 0.1s',
                        }}
                      >
                        {isSel ? (
                          <div style={{
                            background: s.color, color: '#fff',
                            borderRadius: 6, padding: '5px 14px',
                            fontSize: 11.5, fontWeight: 700,
                          }}>
                            Build
                          </div>
                        ) : (
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            border: `1.5px dashed ${s.border}`, opacity: 0.35,
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Expanded: blocked platforms */}
                {isExp && deps.length > 0 && (
                  <div style={{ background: '#FAFAF8', borderTop: '1px solid #F0EFEB', padding: '14px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                      Blocked until {db.label} is built
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {deps.map(p => (
                        <div key={p.name} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: '#fff', border: '1px solid #E5E4E0',
                          borderRadius: 8, padding: '7px 14px', fontSize: 12,
                        }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ color: '#1A1A18', fontWeight: 500 }}>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Already exists section */}
          <div
            onClick={() => setShowBuilt(v => !v)}
            style={{
              background: '#f0fdf4', borderTop: '1px solid #bbf7d0',
              padding: '10px 20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer',
              borderBottom: showBuilt ? '1px solid #bbf7d0' : 'none',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Already exists ({built.length})
            </span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{showBuilt ? 'Hide ▲' : 'Show ▼'}</span>
          </div>

          {showBuilt && built.map((db, idx) => {
            const s = DB_STYLES[db.cls] ?? { bg: '#F2F2EE', color: '#444441', border: '#CCCCCC' };
            const deps = depMap[db.cls] ?? [];
            const isExp = expanded === db.cls;

            return (
              <div key={db.cls} style={{ borderBottom: idx < built.length - 1 ? '1px solid #F0EFEB' : 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', alignItems: 'center' }}>
                  <div
                    onClick={() => setExpanded(isExp ? null : db.cls)}
                    style={{ padding: '14px 20px', borderRight: '1px solid #F0EFEB', cursor: deps.length > 0 ? 'pointer' : 'default' }}
                  >
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 10,
                      fontSize: 11.5, fontWeight: 600, marginBottom: 6,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    }}>
                      {db.label}
                    </span>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>Live</div>
                    {deps.length > 0 && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
                        {deps.length} platform{deps.length !== 1 ? 's' : ''} use this {isExp ? '▲' : '▼'}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0 20px' }}>
                    <div style={{
                      height: 34, borderRadius: 7,
                      background: '#dcfce7', border: '1px solid #86efac',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600, color: '#16a34a',
                    }}>
                      ✓ Available now — all quarters
                    </div>
                  </div>
                </div>

                {isExp && deps.length > 0 && (
                  <div style={{ background: '#FAFAF8', borderTop: '1px solid #F0EFEB', padding: '14px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                      Platforms using this database
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {deps.map(p => (
                        <div key={p.name} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: '#fff', border: '1px solid #E5E4E0',
                          borderRadius: 8, padding: '7px 14px', fontSize: 12,
                        }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ color: '#1A1A18', fontWeight: 500 }}>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
