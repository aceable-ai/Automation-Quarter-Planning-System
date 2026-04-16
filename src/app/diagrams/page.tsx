'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MasterProject {
  id: string;
  name: string;
  color: string;
  status: string;
  diagram_data: { nodes: unknown[]; edges: unknown[] } | null;
}

export default function DiagramsPage() {
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch('/api/master-projects')
      .then(r => r.json() as Promise<MasterProject[]>)
      .then(p => setProjects(p.filter(proj => proj.status !== 'shipped')))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Architecture Diagrams</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Visual architecture maps for each project. Click to open the diagram canvas.
      </p>

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
