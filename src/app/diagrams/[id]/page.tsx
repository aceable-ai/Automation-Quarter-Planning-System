'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeTypes,
  Handle,
  Position,
  type NodeProps,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* ── Custom Node Components (same as project diagram) ── */

function BoxNode({ data, selected }: NodeProps) {
  return (
    <div style={{
      padding: '10px 16px', background: '#fff', border: `2px solid ${selected ? '#4f46e5' : '#333'}`,
      borderRadius: 4, fontSize: 13, fontWeight: 500, minWidth: 100, textAlign: 'center',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div>{data['label'] as string}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}

function RoundedNode({ data, selected }: NodeProps) {
  return (
    <div style={{
      padding: '10px 20px', background: '#fff', border: `2px solid ${selected ? '#4f46e5' : '#333'}`,
      borderRadius: 24, fontSize: 13, fontWeight: 500, minWidth: 100, textAlign: 'center',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div>{data['label'] as string}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}

function CylinderNode({ data, selected }: NodeProps) {
  const border = selected ? '#4f46e5' : '#333';
  return (
    <div style={{ textAlign: 'center', position: 'relative', minWidth: 90 }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555', top: -2 }} />
      <svg width="100%" height="70" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="50" cy="12" rx="48" ry="12" fill="#fff" stroke={border} strokeWidth="2" />
        <rect x="2" y="12" width="96" height="44" fill="#fff" stroke={border} strokeWidth="2" />
        <line x1="2" y1="12" x2="2" y2="56" stroke={border} strokeWidth="2" />
        <line x1="98" y1="12" x2="98" y2="56" stroke={border} strokeWidth="2" />
        <ellipse cx="50" cy="56" rx="48" ry="12" fill="#fff" stroke={border} strokeWidth="2" />
        <ellipse cx="50" cy="12" rx="48" ry="12" fill="#fff" stroke={border} strokeWidth="2" />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {data['label'] as string}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -2 }} />
    </div>
  );
}

function DiamondNode({ data, selected }: NodeProps) {
  const border = selected ? '#4f46e5' : '#333';
  return (
    <div style={{ textAlign: 'center', position: 'relative', width: 100, height: 100 }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555', top: -2 }} />
      <svg width="100" height="100" viewBox="0 0 100 100">
        <polygon points="50,2 98,50 50,98 2,50" fill="#fff" stroke={border} strokeWidth="2" />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {data['label'] as string}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -2 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { box: BoxNode, rounded: RoundedNode, cylinder: CylinderNode, diamond: DiamondNode };

type ShapeType = 'box' | 'rounded' | 'cylinder' | 'diamond';
const SHAPE_OPTIONS: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'box', label: 'Box', icon: '\u25A1' },
  { type: 'rounded', label: 'Service', icon: '\u25CB' },
  { type: 'cylinder', label: 'Database', icon: '\u25AD' },
  { type: 'diamond', label: 'Decision', icon: '\u25C7' },
];

interface StandaloneDiagram {
  id: string; name: string; color: string;
  diagram_data: { nodes: Node[]; edges: Edge[] } | null;
}

export default function StandaloneDiagramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [diagram, setDiagram] = useState<StandaloneDiagram | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('box');
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [showPromote, setShowPromote] = useState(false);
  const [promoteId, setPromoteId] = useState('');
  const [promoteName, setPromoteName] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void fetch(`/api/standalone-diagrams/${id}`)
      .then(r => r.json() as Promise<StandaloneDiagram>)
      .then(d => {
        setDiagram(d);
        setNodes(d.diagram_data?.nodes ?? []);
        setEdges(d.diagram_data?.edges ?? []);
      })
      .finally(() => setLoaded(true));
  }, [id]);

  const saveDiagram = useCallback((n: Node[], e: Edge[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch(`/api/standalone-diagrams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagramData: { nodes: n, edges: e } }),
      });
    }, 800);
  }, [id]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes(prev => {
      const next = applyNodeChanges(changes, prev);
      saveDiagram(next, edges);
      return next;
    });
  }, [edges, saveDiagram]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges(prev => {
      const next = applyEdgeChanges(changes, prev);
      saveDiagram(nodes, next);
      return next;
    });
  }, [nodes, saveDiagram]);

  const onConnect: OnConnect = useCallback((connection) => {
    setEdges(prev => {
      const next = addEdge({
        ...connection,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
      }, prev);
      saveDiagram(nodes, next);
      return next;
    });
  }, [nodes, saveDiagram]);

  function addNode() {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: selectedShape,
      position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { label: 'New Node' },
    };
    setNodes(prev => {
      const next = [...prev, newNode];
      saveDiagram(next, edges);
      return next;
    });
    setEditingNode(newId);
    setEditLabel('New Node');
  }

  function handleNodeDoubleClick(_event: React.MouseEvent, node: Node) {
    setEditingNode(node.id);
    setEditLabel(node.data['label'] as string);
  }

  function saveNodeLabel() {
    if (!editingNode) return;
    setNodes(prev => {
      const next = prev.map(n =>
        n.id === editingNode ? { ...n, data: { ...n.data, label: editLabel } } : n
      );
      saveDiagram(next, edges);
      return next;
    });
    setEditingNode(null);
  }

  function deleteSelected() {
    setNodes(prev => {
      const selectedIds = new Set(prev.filter(n => n.selected).map(n => n.id));
      const next = prev.filter(n => !n.selected);
      const nextEdges = edges.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target));
      setEdges(nextEdges);
      saveDiagram(next, nextEdges);
      return next;
    });
  }

  function saveName() {
    if (!draftName.trim() || !diagram) return;
    setEditingName(false);
    setDiagram({ ...diagram, name: draftName.trim() });
    void fetch(`/api/standalone-diagrams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: draftName.trim() }),
    });
  }

  async function promoteToProject() {
    if (!promoteId.trim() || !promoteName.trim()) return;

    // Create new master project with diagram data
    const res = await fetch('/api/master-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: promoteId.trim(),
        name: promoteName.trim(),
        color: diagram?.color ?? '#6366f1',
        phases: JSON.stringify([]),
      }),
    });

    if (res.ok) {
      // Copy diagram data to the new project
      await fetch(`/api/diagrams/${promoteId.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      // Delete standalone diagram
      await fetch(`/api/standalone-diagrams/${id}`, { method: 'DELETE' });

      router.push(`/master-plans/${promoteId.trim()}`);
    }
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading diagram...</div>;
  if (!diagram) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Diagram not found</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/diagrams" style={{ color: '#6366f1', textDecoration: 'none', fontSize: 13 }}>Diagrams</Link>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>/</span>
          {editingName ? (
            <input autoFocus value={draftName} onChange={e => setDraftName(e.target.value)}
              onBlur={saveName} onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
              style={{ fontSize: 15, fontWeight: 700, border: '1.5px solid #4f46e5', borderRadius: 4, padding: '2px 8px' }} />
          ) : (
            <span style={{ fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { setEditingName(true); setDraftName(diagram.name); }}>
              {diagram.name} <span style={{ fontSize: 10, opacity: 0.3 }}>&#9998;</span>
            </span>
          )}
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#fef9c3', color: '#854d0e' }}>Standalone</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setShowPromote(true); setPromoteName(diagram.name); setPromoteId(diagram.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }}
            style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#16a34a', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Promote to Project
          </button>
          <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>Auto-saves &middot; Double-click to rename</div>
        </div>
      </div>

      {/* Promote modal */}
      {showPromote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowPromote(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 380, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Promote to Master Plan</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Creates a new project with this diagram attached.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Project ID (slug)</label>
              <input value={promoteId} onChange={e => setPromoteId(e.target.value)} placeholder="e.g. my-new-tool"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Project Name</label>
              <input value={promoteName} onChange={e => setPromoteName(e.target.value)} placeholder="My New Tool"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPromote(false)}
                style={{ padding: '8px 16px', fontSize: 13, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => void promoteToProject()} disabled={!promoteId.trim() || !promoteName.trim()}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: promoteId.trim() && promoteName.trim() ? '#16a34a' : '#d1d5db', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={nodeTypes} fitView deleteKeyCode="Backspace" multiSelectionKeyCode="Shift"
          style={{ background: '#fafbfc' }}
        >
          <Background gap={20} size={1} color="#e5e7eb" />
          <Controls />
          <MiniMap nodeStrokeWidth={3} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }} />
          <Panel position="top-left">
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: 12, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 2 }}>Add Shape</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {SHAPE_OPTIONS.map(s => (
                  <button key={s.type} onClick={() => setSelectedShape(s.type)} title={s.label}
                    style={{
                      width: 36, height: 36, fontSize: 18, border: '2px solid',
                      borderColor: selectedShape === s.type ? '#4f46e5' : '#d1d5db',
                      background: selectedShape === s.type ? '#eef2ff' : '#fff',
                      borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {s.icon}
                  </button>
                ))}
              </div>
              <button onClick={addNode} style={{
                padding: '6px 0', fontSize: 12, fontWeight: 600, color: '#fff',
                background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer',
              }}>+ Add {SHAPE_OPTIONS.find(s => s.type === selectedShape)?.label}</button>
              <button onClick={deleteSelected} style={{
                padding: '5px 0', fontSize: 11, fontWeight: 600, color: '#dc2626',
                background: '#fff', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer',
              }}>Delete Selected</button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Edit label modal */}
      {editingNode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setEditingNode(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 300, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Edit Label</h3>
            <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveNodeLabel(); if (e.key === 'Escape') setEditingNode(null); }}
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #4f46e5', borderRadius: 6, fontSize: 14 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingNode(null)}
                style={{ padding: '6px 14px', fontSize: 13, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveNodeLabel}
                style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
