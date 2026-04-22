'use client';

import { useState, useEffect } from 'react';

interface FeedbackItem {
  id: string; source: string; source_id: string | null; project_id: string | null;
  category: string; author: string; title: string; body: string | null;
  status: string; backlog_item_id: string | null; created_at: string;
}

interface MasterProject {
  id: string; name: string; color: string;
}

const DEFAULT_CATEGORY = { bg: '#f3f4f6', text: '#6b7280' } as const;
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'feature-request': { bg: '#dbeafe', text: '#1e40af' },
  'bug':             { bg: '#fef2f2', text: '#991b1b' },
  'process-issue':   { bg: '#fef9c3', text: '#854d0e' },
  'praise':          { bg: '#dcfce7', text: '#166534' },
  'other':           DEFAULT_CATEGORY,
};

const DEFAULT_STATUS = { bg: '#fef9c3', text: '#854d0e' } as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  DEFAULT_STATUS,
  approved: { bg: '#dcfce7', text: '#166534' },
  declined: { bg: '#f3f4f6', text: '#6b7280' },
};

export default function FeedbackInboxPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'intake-form'>('all');
  const [approving, setApproving] = useState<string | null>(null);
  const [approveProject, setApproveProject] = useState('');
  const [approveEffort, setApproveEffort] = useState('M');
  const [promoting, setPromoting] = useState<string | null>(null);
  const [promoteId, setPromoteId] = useState('');
  const [promoteName, setPromoteName] = useState('');
  const [promoteDescription, setPromoteDescription] = useState('');

  useEffect(() => {
    void Promise.all([
      fetch('/api/feedback-inbox').then(r => r.json() as Promise<FeedbackItem[]>),
      fetch('/api/master-projects').then(r => r.json() as Promise<MasterProject[]>),
    ]).then(([f, p]: [FeedbackItem[], MasterProject[]]) => {
      setItems(f);
      setProjects(p);
    }).finally(() => setLoaded(true));
  }, []);

  const statusFiltered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const filtered = sourceFilter === 'all' ? statusFiltered : statusFiltered.filter(i => i.source === sourceFilter);
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const intakeCount = items.filter(i => i.source === 'intake-form' && i.status === 'pending').length;

  async function approveToBacklog(item: FeedbackItem) {
    if (!approveProject) return;

    // Count existing items for this project to generate ID
    const backlogRes = await fetch(`/api/backlog?project=${approveProject}`);
    const existing = (await backlogRes.json()) as unknown[];
    const nextNum = existing.length + 1;
    const prefix = approveProject.replace(/-/g, '').slice(0, 3).toUpperCase();
    const itemId = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    // Create backlog item
    const createRes = await fetch('/api/backlog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: itemId,
        projectId: approveProject,
        title: item.title,
        description: item.body ? `${item.body}\n\n(From ${item.source} feedback by ${item.author})` : `From ${item.source} feedback by ${item.author}`,
        effort: approveEffort,
      }),
    });

    if (createRes.ok) {
      const backlogItem = (await createRes.json()) as { id: string };
      // Update feedback item status
      await fetch(`/api/feedback-inbox/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', backlogItemId: backlogItem.id, projectId: approveProject }),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'approved', backlog_item_id: backlogItem.id, project_id: approveProject } : i));
      setApproving(null);
      setApproveProject('');
      setApproveEffort('M');
    }
  }

  async function promoteToMasterPlan(item: FeedbackItem) {
    if (!promoteId.trim() || !promoteName.trim()) return;

    const createRes = await fetch('/api/master-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: promoteId.trim(),
        name: promoteName.trim(),
        description: promoteDescription.trim() || (item.body ?? ''),
      }),
    });

    if (createRes.ok) {
      await fetch(`/api/feedback-inbox/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', projectId: promoteId.trim() }),
      });
      const newProject = (await createRes.json()) as MasterProject;
      setProjects(prev => [...prev, newProject]);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'approved', project_id: promoteId.trim() } : i));
      setPromoting(null);
      setPromoteId('');
      setPromoteName('');
      setPromoteDescription('');
    }
  }

  async function decline(item: FeedbackItem) {
    await fetch(`/api/feedback-inbox/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'declined' }),
    });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'declined' } : i));
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Feedback Inbox</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {pendingCount} pending &middot; Review feedback from your tools and approve to backlog or decline.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {(['pending', 'approved', 'declined', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 99, cursor: 'pointer',
            background: filter === f ? '#4f46e5' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280',
            border: 'none',
          }}>
            {f === 'pending' ? `Pending (${pendingCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setSourceFilter('all')} style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
          background: sourceFilter === 'all' ? '#111827' : '#fff',
          color: sourceFilter === 'all' ? '#fff' : '#6b7280',
          border: '1px solid ' + (sourceFilter === 'all' ? '#111827' : '#e5e7eb'),
        }}>
          All sources
        </button>
        <button onClick={() => setSourceFilter('intake-form')} style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
          background: sourceFilter === 'intake-form' ? '#7c3aed' : '#fff',
          color: sourceFilter === 'intake-form' ? '#fff' : '#6b7280',
          border: '1px solid ' + (sourceFilter === 'intake-form' ? '#7c3aed' : '#e5e7eb'),
        }}>
          Intake form{intakeCount > 0 ? ` (${intakeCount})` : ''}
        </button>
      </div>

      {/* How to submit feedback */}
      <details style={{ marginBottom: 16, fontSize: 12, color: '#9ca3af' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How to send feedback to this inbox</summary>
        <div style={{ marginTop: 8, padding: 12, background: '#f9fafb', borderRadius: 8, lineHeight: 1.8 }}>
          <strong>From any tool, POST to this AQPS instance:</strong>
          <pre style={{ background: '#1f2937', color: '#e5e7eb', padding: 12, borderRadius: 6, marginTop: 8, fontSize: 11, overflow: 'auto' }}>
{`POST /api/feedback-inbox
Content-Type: application/json

{
  "source": "promo-hub",       // which tool
  "title": "Need bulk upload",  // short title
  "body": "Details here...",    // optional details
  "category": "feature-request", // bug | feature-request | process-issue | praise | other
  "author": "Peggy",            // who submitted
  "projectId": "promo-hub"      // optional: pre-assign to project
}`}
          </pre>
        </div>
      </details>

      {/* Feedback list */}
      {filtered.length === 0 ? (
        <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            {filter === 'pending' ? 'No pending feedback. Your inbox is clear!' : `No ${filter} items.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => {
            const cat = (CATEGORY_COLORS as Record<string, { bg: string; text: string } | undefined>)[item.category] ?? DEFAULT_CATEGORY;
            const sc = (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[item.status] ?? DEFAULT_STATUS;
            const proj = projects.find(p => p.id === item.project_id);

            const isIntake = item.source === 'intake-form';
            return (
              <div key={item.id} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16,
                borderLeft: isIntake
                  ? '4px solid #7c3aed'
                  : item.status === 'pending' ? '4px solid #f59e0b'
                  : item.status === 'approved' ? '4px solid #16a34a'
                  : '4px solid #d1d5db',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{item.title}</span>
                      {isIntake && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                          background: '#ede9fe', color: '#7c3aed',
                        }}>Intake</span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                        background: cat.bg, color: cat.text,
                      }}>{item.category}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                        background: sc.bg, color: sc.text,
                      }}>{item.status}</span>
                      {proj && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                          background: `${proj.color}18`, color: proj.color,
                        }}>{proj.name}</span>
                      )}
                    </div>
                    {item.body && <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.5 }}>{item.body}</p>}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                      From <strong>{item.source}</strong> by {item.author} &middot; {new Date(item.created_at).toLocaleDateString()}
                      {item.backlog_item_id && <span> &middot; Backlog: <strong>{item.backlog_item_id}</strong></span>}
                    </div>
                  </div>

                  {item.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setApproving(item.id); setPromoting(null); setApproveProject(item.project_id ?? ''); }}
                        style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#16a34a', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                        Add to existing plan
                      </button>
                      <button onClick={() => {
                        setPromoting(item.id);
                        setApproving(null);
                        setPromoteId('');
                        setPromoteName(item.title);
                        setPromoteDescription(item.body ?? '');
                      }}
                        style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#7c3aed', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                        Promote to Master Plan
                      </button>
                      <button onClick={() => void decline(item)}
                        style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Approve form */}
                {approving === item.id && (
                  <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Project</label>
                      <select value={approveProject} onChange={e => setApproveProject(e.target.value)}
                        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                        <option value="">Select project...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Effort</label>
                      <select value={approveEffort} onChange={e => setApproveEffort(e.target.value)}
                        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                        {['XS', 'S', 'M', 'L', 'XL'].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <button onClick={() => void approveToBacklog(item)} disabled={!approveProject}
                      style={{
                        padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff',
                        background: approveProject ? '#16a34a' : '#d1d5db',
                        border: 'none', borderRadius: 6, cursor: approveProject ? 'pointer' : 'not-allowed',
                      }}>
                      Add to Backlog
                    </button>
                    <button onClick={() => setApproving(null)}
                      style={{ padding: '6px 14px', fontSize: 12, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}

                {/* Promote to Master Plan form */}
                {promoting === item.id && (
                  <div style={{ marginTop: 12, padding: 12, background: '#f5f3ff', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 140 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Project ID (slug)</label>
                      <input value={promoteId} onChange={e => setPromoteId(e.target.value)} placeholder="e.g. my-new-project"
                        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
                    </div>
                    <div style={{ minWidth: 160, flex: 1 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Project name</label>
                      <input value={promoteName} onChange={e => setPromoteName(e.target.value)}
                        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
                    </div>
                    <div style={{ minWidth: 200, flex: 2 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Description</label>
                      <input value={promoteDescription} onChange={e => setPromoteDescription(e.target.value)}
                        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
                    </div>
                    <button onClick={() => void promoteToMasterPlan(item)} disabled={!promoteId.trim() || !promoteName.trim()}
                      style={{
                        padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff',
                        background: promoteId.trim() && promoteName.trim() ? '#7c3aed' : '#d1d5db',
                        border: 'none', borderRadius: 6,
                        cursor: promoteId.trim() && promoteName.trim() ? 'pointer' : 'not-allowed',
                      }}>
                      Create Master Plan
                    </button>
                    <button onClick={() => setPromoting(null)}
                      style={{ padding: '6px 14px', fontSize: 12, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
