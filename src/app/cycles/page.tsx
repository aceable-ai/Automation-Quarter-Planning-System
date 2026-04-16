'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Cycle {
  id: string; name: string; start_date: string; end_date: string;
  goal: string | null; budget_weeks: string; status: string;
  created_at: string;
}

interface BacklogItem {
  id: string; cycle_id: string | null; status: string;
}

const DEFAULT_STATUS = { bg: '#fef9c3', text: '#854d0e' } as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  planning:  DEFAULT_STATUS,
  active:    { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
};

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch('/api/cycles').then(r => r.json() as Promise<Cycle[]>),
      fetch('/api/backlog').then(r => r.json() as Promise<BacklogItem[]>),
    ]).then(([c, b]: [Cycle[], BacklogItem[]]) => {
      setCycles(c);
      setItems(b);
    }).finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Cycle History</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Track what shipped, what didn&apos;t, and learnings across 6-week cycles.
      </p>

      {cycles.length === 0 ? (
        <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280' }}>No cycles yet. Create one from Cycle Planning.</p>
          <Link href="/cycle-planning" style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Go to Cycle Planning &rarr;
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cycles.map(c => {
            const cycleItems = items.filter(i => i.cycle_id === c.id);
            const done = cycleItems.filter(i => i.status === 'done').length;
            const total = cycleItems.length;
            const sc = (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[c.status] ?? DEFAULT_STATUS;

            return (
              <Link href={`/cycles/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                  padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{c.name}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: sc.bg, color: sc.text,
                      }}>{c.status}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{c.start_date} &rarr; {c.end_date}</span>
                  </div>

                  {c.goal && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>{c.goal}</p>}

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
                    <span>{total} item{total !== 1 ? 's' : ''}</span>
                    {total > 0 && <span style={{ color: '#16a34a' }}>{done}/{total} shipped</span>}
                    {total > 0 && (
                      <div style={{ flex: 1, maxWidth: 200, display: 'flex', alignItems: 'center' }}>
                        <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
                          <div style={{ height: '100%', width: `${total ? (done / total) * 100 : 0}%`, background: '#16a34a', borderRadius: 2 }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
