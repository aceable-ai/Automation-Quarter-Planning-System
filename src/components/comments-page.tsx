'use client';

import { useState, useEffect, useMemo } from 'react';

interface Comment {
  id: string;
  project_name: string;
  author: string;
  content: string;
  vetted: boolean;
  created_at: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('All');
  const [filterVetted, setFilterVetted] = useState<'all' | 'vetted' | 'unvetted'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    fetch('/api/comments')
      .then(r => r.json())
      .then((data: Comment[]) => setComments(data))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const projects = useMemo(() => {
    const names = [...new Set(comments.map(c => c.project_name))].sort();
    return ['All', ...names];
  }, [comments]);

  const filtered = useMemo(() => comments.filter(c => {
    if (filterProject !== 'All' && c.project_name !== filterProject) return false;
    if (filterVetted === 'vetted' && !c.vetted) return false;
    if (filterVetted === 'unvetted' && c.vetted) return false;
    return true;
  }), [comments, filterProject, filterVetted]);

  async function toggleVet(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: 'PATCH' });
    const updated = await res.json() as Comment;
    setComments(prev => prev.map(c => c.id === id ? updated : c));
  }

  function startEdit(c: Comment) {
    setEditingId(c.id);
    setEditDraft(c.content);
  }

  async function saveEdit(id: string) {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: trimmed }),
    });
    const updated = await res.json() as Comment;
    setComments(prev => prev.map(c => c.id === id ? updated : c));
    setEditingId(null);
  }

  async function deleteComment(id: string) {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    setComments(prev => prev.filter(c => c.id !== id));
  }

  const unvetted = comments.filter(c => !c.vetted).length;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F7F7F5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E4E0', padding: '28px 40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A18', letterSpacing: '-0.3px' }}>
              All Comments
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6B6B67', fontSize: 13 }}>
              {comments.length} total · {unvetted > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{unvetted} need review</span>}
              {unvetted === 0 && comments.length > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}>all vetted ✓</span>}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#9B9B97', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
          {(['all', 'unvetted', 'vetted'] as const).map(v => (
            <button key={v} onClick={() => setFilterVetted(v)} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all 0.1s',
              border: filterVetted === v ? '1.5px solid #1A1A18' : '1px solid #DDDDD8',
              background: filterVetted === v ? '#1A1A18' : '#fff',
              color: filterVetted === v ? '#fff' : '#444441',
              fontWeight: filterVetted === v ? 600 : 400,
            }}>
              {v === 'all' ? 'All' : v === 'unvetted' ? 'Needs review' : 'Vetted'}
            </button>
          ))}
          <span style={{ fontSize: 11, fontWeight: 600, color: '#9B9B97', textTransform: 'uppercase', letterSpacing: '0.06em', marginLeft: 8 }}>Project</span>
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #DDDDD8', fontSize: 12, color: '#1A1A18', background: '#fff', outline: 'none' }}
          >
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div style={{ padding: '28px 40px' }}>
        {loading && <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>No comments match your filters.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <div key={c.id} style={{
              background: '#fff', border: `1px solid ${c.vetted ? '#bbf7d0' : '#E5E4E0'}`,
              borderLeft: `4px solid ${c.vetted ? '#16a34a' : '#d97706'}`,
              borderRadius: 10, padding: '16px 20px',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A18' }}>{c.author}</span>
                    {c.vetted
                      ? <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>Vetted ✓</span>
                      : <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#fef9c3', color: '#854d0e', fontWeight: 700 }}>Needs review</span>
                    }
                    <span style={{ fontSize: 11, color: '#9B9B97' }}>
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {/* Project reference */}
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#9B9B97', textTransform: 'uppercase', letterSpacing: '0.05em' }}>On project:</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#4f46e5', background: '#ede9fe', padding: '2px 8px', borderRadius: 4 }}>
                      {c.project_name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => void toggleVet(c.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${c.vetted ? '#bbf7d0' : '#d97706'}`,
                      background: c.vetted ? '#f0fdf4' : '#fffbeb',
                      color: c.vetted ? '#16a34a' : '#d97706',
                    }}
                  >
                    {c.vetted ? '↩ Unvet' : '✓ Vet'}
                  </button>
                  {editingId !== c.id && (
                    <button
                      onClick={() => startEdit(c)}
                      style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: '1px solid #DDDDD8', background: '#fff', color: '#444441', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => void deleteComment(c.id)}
                    style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 600 }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Comment body */}
              {editingId === c.id ? (
                <div style={{ marginTop: 4 }}>
                  <textarea
                    autoFocus
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') setEditingId(null);
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void saveEdit(c.id);
                    }}
                    style={{
                      width: '100%', minHeight: 80, padding: '8px 10px', fontSize: 13,
                      color: '#3A3A37', lineHeight: 1.6, border: '1.5px solid #4f46e5',
                      borderRadius: 6, outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafafe',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button
                      onClick={() => void saveEdit(c.id)}
                      style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #4f46e5', background: '#4f46e5', color: '#fff' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: '1px solid #DDDDD8', background: '#fff', color: '#666' }}
                    >
                      Cancel
                    </button>
                    <span style={{ fontSize: 11, color: '#aaa', alignSelf: 'center' }}>⌘↵ to save</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#3A3A37', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
