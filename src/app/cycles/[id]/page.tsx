'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface Cycle {
  id: string; name: string; start_date: string; end_date: string;
  goal: string | null; budget_weeks: string; status: string;
  retro_shipped: string | null; retro_missed: string | null; retro_learnings: string | null;
}

interface BacklogItem {
  id: string; project_id: string; title: string; impact: string;
  effort: string; effort_weeks: string; priority: string; status: string;
  project_name?: string; project_color?: string;
}

const DEFAULT_STATUS = { bg: '#f3f4f6', text: '#6b7280' } as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  backlog:       DEFAULT_STATUS,
  planned:       { bg: '#dbeafe', text: '#1e40af' },
  'in-progress': { bg: '#fef9c3', text: '#854d0e' },
  done:          { bg: '#dcfce7', text: '#166534' },
  cut:           { bg: '#fef2f2', text: '#991b1b' },
};

export default function CycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingRetro, setEditingRetro] = useState<string | null>(null);
  const [draftRetro, setDraftRetro] = useState('');

  useEffect(() => {
    void Promise.all([
      fetch(`/api/cycles/${id}`).then(r => r.json() as Promise<Cycle>),
      fetch(`/api/cycles/${id}/items`).then(r => r.json() as Promise<BacklogItem[]>),
    ]).then(([c, i]: [Cycle, BacklogItem[]]) => {
      setCycle(c);
      setItems(i);
    }).finally(() => setLoaded(true));
  }, [id]);

  async function saveRetro(field: string) {
    if (!cycle) return;
    setEditingRetro(null);
    const fieldMap: Record<string, string> = {
      retro_shipped: 'retroShipped', retro_missed: 'retroMissed', retro_learnings: 'retroLearnings',
    };
    const apiField = fieldMap[field] ?? field;
    const body = { [apiField]: draftRetro };
    const res = await fetch(`/api/cycles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = (await res.json()) as Cycle;
      setCycle(updated);
    }
  }

  async function completeCycle() {
    if (!cycle) return;
    const res = await fetch(`/api/cycles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Cycle;
      setCycle(updated);
    }
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;
  if (!cycle) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Cycle not found</div>;

  const done = items.filter(i => i.status === 'done').length;
  const total = items.length;
  const committedWeeks = items.reduce((sum, i) => sum + Number(i.effort_weeks), 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, fontSize: 13, color: '#9ca3af' }}>
        <Link href="/cycles" style={{ color: '#6366f1', textDecoration: 'none' }}>Cycle History</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span style={{ color: '#374151' }}>{cycle.name}</span>
      </div>

      {/* Cycle header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{cycle.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              background: cycle.status === 'completed' ? '#dbeafe' : cycle.status === 'active' ? '#dcfce7' : '#fef9c3',
              color: cycle.status === 'completed' ? '#1e40af' : cycle.status === 'active' ? '#166534' : '#854d0e',
            }}>{cycle.status}</span>
            {cycle.status === 'active' && (
              <button onClick={() => void completeCycle()} style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff',
                background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer',
              }}>Complete Cycle</button>
            )}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{cycle.start_date} &rarr; {cycle.end_date}</div>
        {cycle.goal && <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{cycle.goal}</p>}
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6b7280', marginTop: 12 }}>
          <span>{total} items</span>
          <span style={{ color: '#16a34a' }}>{done} shipped</span>
          <span>{committedWeeks}w committed / {cycle.budget_weeks}w budget</span>
        </div>
      </div>

      <DrawingPanel cycleId={cycle.id} />

      {/* Committed items */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Committed Work</h2>
        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No items were committed to this cycle.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>ID</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Feature</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Project</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Effort</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const sc = (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[item.status] ?? DEFAULT_STATUS;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{item.id}</td>
                    <td style={{ padding: '8px 6px', fontWeight: 500, color: '#111827' }}>{item.title}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: item.project_color ? `${item.project_color}18` : '#f3f4f6',
                        color: item.project_color ?? '#6b7280',
                      }}>{item.project_name ?? item.project_id}</span>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>{item.effort} ({item.effort_weeks}w)</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: sc.bg, color: sc.text,
                      }}>{item.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Retrospective */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Retrospective</h2>

        {[
          { key: 'retro_shipped', label: 'What shipped', color: '#16a34a' },
          { key: 'retro_missed', label: "What didn't ship (and why)", color: '#dc2626' },
          { key: 'retro_learnings', label: 'Learnings', color: '#2563eb' },
        ].map(({ key, label, color }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 6 }}>{label}</h3>
            {editingRetro === key ? (
              <div>
                <textarea value={draftRetro} onChange={e => setDraftRetro(e.target.value)} rows={4}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #4f46e5', borderRadius: 6, fontSize: 13, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => void saveRetro(key)} style={{ padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setEditingRetro(null)} style={{ padding: '4px 12px', fontSize: 12, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer', margin: 0, minHeight: 20, lineHeight: 1.6 }}
                onClick={() => { setEditingRetro(key); setDraftRetro((cycle as unknown as Record<string, string | null>)[key] ?? ''); }}>
                {(cycle as unknown as Record<string, string | null>)[key] ?? 'Click to add...'}
                <span style={{ fontSize: 10, opacity: 0.3, marginLeft: 4 }}>&#9998;</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface Drawing {
  id: string;
  cycle_id: string;
  winner_submission_id: string | null;
  winner_name: string;
  song_url: string | null;
  song_generated_at: string | null;
  drawn_at: string;
}

interface DrawingEntry {
  id: string;
  author: string;
  title: string;
  created_at: string;
}

function DrawingPanel({ cycleId }: { cycleId: string }) {
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [entries, setEntries] = useState<DrawingEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawing_running, setDrawingRunning] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch(`/api/cycles/${cycleId}/draw-winner`).then(r => r.json() as Promise<{ drawing: Drawing | null }>),
      fetch(`/api/cycles/${cycleId}/drawing-entries`).then(r => r.json() as Promise<{ entries: DrawingEntry[] }>),
    ])
      .then(([d, e]) => {
        setDrawing(d.drawing);
        setEntries(e.entries);
        if (d.drawing) setReveal(true);
      })
      .finally(() => setLoaded(true));
  }, [cycleId]);

  async function runDrawing() {
    if (entries.length === 0) return;
    setDrawingRunning(true);
    setReveal(false);
    try {
      const res = await fetch(`/api/cycles/${cycleId}/draw-winner`, { method: 'POST' });
      const json = (await res.json()) as { drawing?: Drawing; error?: string };
      if (json.drawing) {
        await new Promise(r => setTimeout(r, 1500));
        setDrawing(json.drawing);
        setReveal(true);
      } else if (json.error) {
        toast.error(`Drawing failed: ${json.error}`);
      }
    } catch (err) {
      console.error('[runDrawing]', err);
      toast.error('Drawing failed — check console');
    } finally {
      setDrawingRunning(false);
    }
  }

  if (!loaded) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)', border: '1px solid #c4b5fd', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#5b21b6' }}>
          🎟️ Theme Song Drawing
        </h2>
        <span style={{ fontSize: 12, color: '#7c3aed' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} this cycle
        </span>
      </div>

      {!drawing ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          {entries.length === 0 ? (
            <p style={{ fontSize: 13, color: '#7c3aed', margin: 0 }}>
              No submissions in this cycle yet. Drawing unavailable until the pool fills.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: '#7c3aed', margin: '0 0 12px' }}>
                Pick one winner from {entries.length} {entries.length === 1 ? 'submitter' : 'submitters'}. They&rsquo;ll get a custom theme song about their problem.
              </p>
              <button
                onClick={() => { void runDrawing(); }}
                disabled={drawing_running}
                style={{
                  padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff',
                  background: drawing_running ? '#9ca3af' : '#7c3aed',
                  border: 'none', borderRadius: 8, cursor: drawing_running ? 'wait' : 'pointer',
                }}
              >
                {drawing_running ? '🎲 Drawing winner…' : '🎲 Run drawing'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: 16,
          background: '#fff', borderRadius: 8,
          opacity: reveal ? 1 : 0,
          transform: reveal ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.4s, transform 0.4s',
        }}>
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>
            🏆 WINNER
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#5b21b6', marginBottom: 4 }}>
            {drawing.winner_name}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
            Drawn {new Date(drawing.drawn_at).toLocaleString()}
          </div>
          {drawing.song_url ? (
            <audio controls src={drawing.song_url} style={{ width: '100%', maxWidth: 480 }}>
              Your browser doesn&rsquo;t support audio playback.
            </audio>
          ) : (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Song not yet generated.</p>
          )}
        </div>
      )}
    </div>
  );
}
