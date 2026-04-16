'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Phase { name: string; description: string; status: string }

interface Project {
  id: string; name: string; description: string; repo_url: string | null;
  stack: string | null; status: string; launched_at: string | null;
  users: string | null; color: string; phases: Phase[];
}

interface BacklogItem {
  id: string; project_id: string; title: string; description: string | null;
  business_value: number; reach: number; urgency: number; impact: string;
  effort: string; effort_weeks: string; priority: string; status: string;
  cycle_id: string | null; notes: string | null;
}

const EFFORT_OPTIONS = ['XS', 'S', 'M', 'L', 'XL'];
const STATUS_OPTIONS = ['backlog', 'planned', 'in-progress', 'done', 'cut'];
const PHASE_STATUSES = ['planned', 'in-progress', 'done'];

const DEFAULT_STATUS = { bg: '#f3f4f6', text: '#6b7280' } as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  backlog:       DEFAULT_STATUS,
  planned:       { bg: '#dbeafe', text: '#1e40af' },
  'in-progress': { bg: '#fef9c3', text: '#854d0e' },
  done:          { bg: '#dcfce7', text: '#166534' },
  cut:           { bg: '#fef2f2', text: '#991b1b' },
};

const PROJECT_STATUSES = ['active', 'stalled', 'shipped'];

const SCORING_GUIDE = {
  businessValue: ['', '1 — Cosmetic', '2 — Nice-to-have', '3 — Moderate improvement', '4 — Significant savings', '5 — Revenue / critical process'],
  reach: ['', '1 — Edge case', '2 — 1 person', '3 — 2-3 people', '4 — Full team', '5 — Entire org'],
  urgency: ['', '1 — Someday', '2 — This quarter', '3 — Next 2 cycles', '4 — This cycle', '5 — Blocking now'],
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDesc, setNewPhaseDesc] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'effort'>('priority');

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch(`/api/master-projects/${id}`).then(r => r.json() as Promise<Project>),
      fetch(`/api/backlog?project=${id}`).then(r => r.json() as Promise<BacklogItem[]>),
    ]).then(([p, b]: [Project, BacklogItem[]]) => {
      setProject(p);
      setItems(b);
    }).finally(() => setLoaded(true));
  }, [id]);

  const saveProject = useCallback((updates: Partial<Project>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch(`/api/master-projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }, 600);
  }, [id]);

  async function updateItem(itemId: string, updates: Record<string, unknown>) {
    const res = await fetch(`/api/backlog/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = (await res.json()) as BacklogItem;
      setItems(prev => prev.map(i => i.id === itemId ? updated : i));
    }
  }

  async function addItem() {
    if (!newTitle.trim()) return;
    const nextNum = items.length + 1;
    const prefix = id.replace(/-/g, '').slice(0, 3).toUpperCase();
    const itemId = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    const res = await fetch('/api/backlog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, projectId: id, title: newTitle.trim() }),
    });
    if (res.ok) {
      const item = (await res.json()) as BacklogItem;
      setItems(prev => [...prev, item]);
      setNewTitle('');
      setShowAddItem(false);
    }
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/backlog/${itemId}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  function updatePhaseStatus(idx: number, newStatus: string) {
    if (!project) return;
    const phases = [...project.phases];
    const current = phases[idx];
    if (!current) return;
    phases[idx] = { name: current.name, description: current.description, status: newStatus };
    setProject({ ...project, phases });
    saveProject({ phases });
  }

  function addPhase() {
    if (!project || !newPhaseName.trim()) return;
    const phases = [...project.phases, { name: newPhaseName.trim(), description: newPhaseDesc.trim(), status: 'planned' }];
    setProject({ ...project, phases });
    saveProject({ phases });
    setNewPhaseName('');
    setNewPhaseDesc('');
    setShowAddPhase(false);
  }

  function removePhase(idx: number) {
    if (!project) return;
    const phases = project.phases.filter((_, i) => i !== idx);
    setProject({ ...project, phases });
    saveProject({ phases });
  }

  function startEditField(field: string, value: string) {
    setEditingField(field);
    setDraftValue(value);
  }

  function saveField(field: string) {
    if (!project) return;
    setEditingField(null);
    const updates: Record<string, string> = { [field]: draftValue };
    setProject({ ...project, ...updates });
    saveProject(updates);
  }

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'priority') return Number(b.priority) - Number(a.priority);
    if (sortBy === 'effort') return Number(a.effort_weeks) - Number(b.effort_weeks);
    return a.status.localeCompare(b.status);
  });

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;
  if (!project) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Project not found</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, fontSize: 13, color: '#9ca3af' }}>
        <Link href="/master-plans" style={{ color: '#6366f1', textDecoration: 'none' }}>Master Plans</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span style={{ color: '#374151' }}>{project.name}</span>
      </div>

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20, borderLeft: `4px solid ${project.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {editingField === 'name' ? (
            <input autoFocus value={draftValue} onChange={e => setDraftValue(e.target.value)}
              onBlur={() => saveField('name')} onKeyDown={e => { if (e.key === 'Enter') saveField('name'); }}
              style={{ fontSize: 22, fontWeight: 700, border: '1.5px solid #4f46e5', borderRadius: 6, padding: '2px 8px', flex: 1 }}
            />
          ) : (
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, cursor: 'pointer' }}
              onClick={() => startEditField('name', project.name)}>
              {project.name} <span style={{ fontSize: 12, opacity: 0.3 }}>&#9998;</span>
            </h1>
          )}
          <select
            value={project.status}
            onChange={e => { setProject({ ...project, status: e.target.value }); saveProject({ status: e.target.value }); }}
            style={{ fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[project.status]?.bg ?? '#f3f4f6', color: (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[project.status]?.text ?? '#6b7280' }}
          >
            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {editingField === 'description' ? (
          <textarea autoFocus value={draftValue} onChange={e => setDraftValue(e.target.value)}
            onBlur={() => saveField('description')} rows={3}
            style={{ width: '100%', fontSize: 14, border: '1.5px solid #4f46e5', borderRadius: 6, padding: '6px 10px', resize: 'vertical' }}
          />
        ) : (
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, margin: '0 0 12px', cursor: 'pointer' }}
            onClick={() => startEditField('description', project.description)}>
            {project.description || 'Click to add a description...'} <span style={{ fontSize: 10, opacity: 0.3 }}>&#9998;</span>
          </p>
        )}

        <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap' }}>
          {project.stack && <span>Stack: {project.stack}</span>}
          {project.users && <span>Users: {project.users}</span>}
          {project.repo_url && <a href={project.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>GitHub</a>}
          {project.launched_at && <span>Launched: {project.launched_at}</span>}
        </div>
      </div>

      {/* Phases */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Phases</h2>
          <button onClick={() => setShowAddPhase(true)} style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Phase</button>
        </div>

        {project.phases.length === 0 && !showAddPhase && (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No phases defined yet. Add phases to track your project roadmap.</p>
        )}

        {project.phases.map((ph, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: idx < project.phases.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <span style={{ width: 24, textAlign: 'center', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{idx + 1}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{ph.name}</span>
              {ph.description && <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{ph.description}</span>}
            </div>
            <select value={ph.status} onChange={e => updatePhaseStatus(idx, e.target.value)}
              style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[ph.status]?.bg ?? '#f3f4f6', color: (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[ph.status]?.text ?? '#6b7280' }}>
              {PHASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => removePhase(idx)} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>&#10005;</button>
          </div>
        ))}

        {showAddPhase && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
            <input value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} placeholder="Phase name"
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            <input value={newPhaseDesc} onChange={e => setNewPhaseDesc(e.target.value)} placeholder="Description (optional)"
              style={{ flex: 2, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            <button onClick={addPhase} style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setShowAddPhase(false)} style={{ padding: '6px 14px', fontSize: 13, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>

      {/* Backlog Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Backlog <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>({items.length} items)</span>
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Sort:</span>
            {(['priority', 'status', 'effort'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, cursor: 'pointer',
                background: sortBy === s ? '#4f46e5' : '#f3f4f6', color: sortBy === s ? '#fff' : '#6b7280',
                border: 'none',
              }}>{s}</button>
            ))}
            <button onClick={() => setShowAddItem(true)} style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>+ Add Item</button>
          </div>
        </div>

        {/* Scoring guide */}
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12, lineHeight: 1.6 }}>
          <strong>Scoring:</strong> BV = Business Value, R = Reach, U = Urgency (each 1-5).
          Impact = avg(BV, R, U). Priority = Impact / Effort-weeks. Higher = do first.
        </div>

        {showAddItem && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Feature title"
              onKeyDown={e => { if (e.key === 'Enter') void addItem(); }}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            <button onClick={() => void addItem()} style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setShowAddItem(false)} style={{ padding: '6px 14px', fontSize: 13, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>ID</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Title</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }} title="Business Value">BV</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }} title="Reach">R</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }} title="Urgency">U</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Impact</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Effort</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Priority</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Status</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(item => {
                const sc = (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[item.status] ?? DEFAULT_STATUS;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{item.id}</td>
                    <td style={{ padding: '8px 6px', fontWeight: 500, color: '#111827', maxWidth: 300 }}>{item.title}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <select value={item.business_value} onChange={e => void updateItem(item.id, { businessValue: Number(e.target.value) })}
                        title={SCORING_GUIDE.businessValue[item.business_value]}
                        style={{ width: 40, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12, padding: '2px 0' }}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <select value={item.reach} onChange={e => void updateItem(item.id, { reach: Number(e.target.value) })}
                        title={SCORING_GUIDE.reach[item.reach]}
                        style={{ width: 40, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12, padding: '2px 0' }}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <select value={item.urgency} onChange={e => void updateItem(item.id, { urgency: Number(e.target.value) })}
                        title={SCORING_GUIDE.urgency[item.urgency]}
                        style={{ width: 40, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12, padding: '2px 0' }}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: Number(item.impact) >= 4 ? '#166534' : Number(item.impact) >= 3 ? '#854d0e' : '#6b7280' }}>
                      {item.impact}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <select value={item.effort} onChange={e => void updateItem(item.id, { effort: e.target.value })}
                        style={{ width: 48, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12, padding: '2px 0' }}>
                        {EFFORT_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: Number(item.priority) >= 3 ? '#166534' : Number(item.priority) >= 1.5 ? '#854d0e' : '#6b7280' }}>
                      {item.priority}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <select value={item.status} onChange={e => void updateItem(item.id, { status: e.target.value })}
                        style={{ fontSize: 11, fontWeight: 600, padding: '3px 6px', borderRadius: 6, border: '1px solid #d1d5db', background: sc.bg, color: sc.text }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <button onClick={() => void deleteItem(item.id)}
                        style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}
                        title="Delete item">&#10005;</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>
            No backlog items yet. Click &quot;+ Add Item&quot; to start building your backlog.
          </p>
        )}
      </div>
    </div>
  );
}
