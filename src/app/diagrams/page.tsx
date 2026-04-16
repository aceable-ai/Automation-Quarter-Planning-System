'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MasterProject {
  id: string;
  name: string;
  color: string;
  status: string;
  diagram_data: { nodes: unknown[]; edges: unknown[] } | null;
}

interface StandaloneDiagram {
  id: string;
  name: string;
  color: string;
  diagram_data: { nodes: unknown[]; edges: unknown[] } | null;
  updated_at: string;
}

export default function DiagramsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [standalones, setStandalones] = useState<StandaloneDiagram[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    void Promise.all([
      fetch('/api/master-projects').then(r => r.json() as Promise<MasterProject[]>),
      fetch('/api/standalone-diagrams').then(r => r.json() as Promise<StandaloneDiagram[]>),
    ]).then(([p, s]: [MasterProject[], StandaloneDiagram[]]) => {
      setProjects(p.filter(proj => proj.status !== 'shipped' && proj.status !== 'archived'));
      setStandalones(s);
    }).finally(() => setLoaded(true));
  }, []);

  async function createDiagram() {
    if (!newName.trim()) return;
    const res = await fetch('/api/standalone-diagrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const d = (await res.json()) as StandaloneDiagram;
      router.push(`/diagrams/${d.id}`);
    }
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Architecture Diagrams</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Visual architecture maps. Create standalone diagrams or open project diagrams.
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          + New Diagram
        </button>
      </div>

      {showNew && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Diagram Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. New CRM Architecture"
              onKeyDown={e => { if (e.key === 'Enter') void createDiagram(); }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
          </div>
          <button onClick={() => void createDiagram()} style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create</button>
          <button onClick={() => setShowNew(false)} style={{ padding: '8px 16px', fontSize: 14, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {/* Standalone diagrams */}
      {standalones.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', marginBottom: 12 }}>Standalone Diagrams</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
            {standalones.map(d => {
              const nodeCount = d.diagram_data?.nodes.length ?? 0;
              const edgeCount = d.diagram_data?.edges.length ?? 0;
              return (
                <Link href={`/diagrams/${d.id}`} key={d.id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                    padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s',
                    borderLeft: `4px solid ${d.color}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{d.name}</h2>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99, background: '#fef9c3', color: '#854d0e' }}>Draft</span>
                    </div>
                    {nodeCount > 0 ? (
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {nodeCount} node{nodeCount !== 1 ? 's' : ''} &middot; {edgeCount} connection{edgeCount !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>Empty canvas — click to start</div>
                    )}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                      Edited {new Date(d.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Project diagrams */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', marginBottom: 12 }}>Project Diagrams</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {projects.map(p => {
          const nodeCount = p.diagram_data?.nodes.length ?? 0;
          const edgeCount = p.diagram_data?.edges.length ?? 0;
          const hasContent = nodeCount > 0;

          return (
            <Link href={`/master-plans/${p.id}/diagram`} key={p.id} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s',
                borderLeft: `4px solid ${p.color}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{p.name}</h2>
                {hasContent ? (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {nodeCount} node{nodeCount !== 1 ? 's' : ''} &middot; {edgeCount} connection{edgeCount !== 1 ? 's' : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>No diagram yet — click to create</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
