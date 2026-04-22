'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MasterProject {
  id: string;
  name: string;
  description: string;
  repo_url: string | null;
  stack: string | null;
  status: string;
  launched_at: string | null;
  users: string | null;
  color: string;
  phases: { name: string; description: string; status: string }[];
  created_at: string;
}

interface BacklogItem {
  id: string;
  project_id: string;
  status: string;
  priority: string;
}

const DEFAULT_BADGE = { bg: '#dcfce7', text: '#166534', label: 'Active' } as const;
const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  active:   DEFAULT_BADGE,
  stalled:  { bg: '#fef9c3', text: '#854d0e', label: 'Stalled' },
  shipped:  { bg: '#dbeafe', text: '#1e40af', label: 'Shipped' },
  archived: { bg: '#f3f4f6', text: '#6b7280', label: 'Archived' },
};

export default function MasterPlansPage() {
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch('/api/master-projects').then(r => r.json() as Promise<MasterProject[]>),
      fetch('/api/backlog').then(r => r.json() as Promise<BacklogItem[]>),
    ]).then(([p, b]: [MasterProject[], BacklogItem[]]) => {
      setProjects(p);
      setBacklog(b);
    }).finally(() => setLoaded(true));
  }, []);

  async function addProject() {
    if (!newId.trim() || !newName.trim()) return;
    const res = await fetch('/api/master-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId.trim(), name: newName.trim() }),
    });
    if (res.ok) {
      const p = (await res.json()) as MasterProject;
      setProjects(prev => [...prev, p]);
      setNewId('');
      setNewName('');
      setShowAdd(false);
    }
  }

  function getBacklogStats(projectId: string) {
    const items = backlog.filter(b => b.project_id === projectId);
    const total = items.length;
    const done = items.filter(b => b.status === 'done').length;
    const inProgress = items.filter(b => b.status === 'in-progress').length;
    const topPriority = items.filter(b => b.status === 'backlog').sort((a, b) => Number(b.priority) - Number(a.priority))[0];
    return { total, done, inProgress, topPriority };
  }

  if (!loaded) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        Loading projects...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Master Plans</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} &middot; {backlog.filter(b => b.status === 'backlog').length} backlog items
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            href="/master-plans/submit"
            style={{
              padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#4f46e5',
              background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            }}
          >
            Submit a problem
          </Link>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#fff',
              background: '#4f46e5', border: 'none', borderRadius: 8, cursor: 'pointer',
            }}
          >
            + Add Project
          </button>
        </div>
      </div>

      {showAdd && (
        <div style={{
          background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12,
          padding: 20, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-end',
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ID (slug)</label>
            <input
              value={newId} onChange={e => setNewId(e.target.value)}
              placeholder="e.g. my-project"
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name</label>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Project display name"
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
            />
          </div>
          <button onClick={() => void addProject()} style={{
            padding: '7px 16px', fontSize: 14, fontWeight: 600, color: '#fff',
            background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer',
          }}>Create</button>
          <button onClick={() => setShowAdd(false)} style={{
            padding: '7px 16px', fontSize: 14, fontWeight: 500, color: '#6b7280',
            background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      )}

      {projects.some(p => p.status === 'archived' || p.status === 'shipped') && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
            Show archived / shipped projects
          </label>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {projects.filter(p => showArchived || (p.status !== 'archived' && p.status !== 'shipped')).map(p => {
          const stats = getBacklogStats(p.id);
          const badge = (STATUS_BADGE as Record<string, { bg: string; text: string; label: string } | undefined>)[p.status] ?? DEFAULT_BADGE;
          const donePhases = p.phases.filter(ph => ph.status === 'done').length;
          const totalPhases = p.phases.length;

          return (
            <Link href={`/master-plans/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s',
                borderLeft: `4px solid ${p.color}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{p.name}</h2>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: badge.bg, color: badge.text,
                  }}>{badge.label}</span>
                </div>

                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.4,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                }}>{p.description || 'No description yet'}</p>

                {p.stack && (
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>{p.stack}</p>
                )}

                {totalPhases > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
                      <span>Phases</span>
                      <span>{donePhases}/{totalPhases}</span>
                    </div>
                    <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalPhases ? (donePhases / totalPhases) * 100 : 0}%`, background: p.color, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
                  <span>{stats.total} item{stats.total !== 1 ? 's' : ''}</span>
                  {stats.inProgress > 0 && <span style={{ color: '#2563eb' }}>{stats.inProgress} in progress</span>}
                  {stats.done > 0 && <span style={{ color: '#16a34a' }}>{stats.done} done</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
