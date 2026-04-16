'use client';

import { useState, useEffect } from 'react';

interface BacklogItem {
  id: string; project_id: string; title: string; description: string | null;
  business_value: number; reach: number; urgency: number; impact: string;
  effort: string; effort_weeks: string; priority: string; status: string;
  cycle_id: string | null; notes: string | null;
}

interface MasterProject {
  id: string; name: string; color: string;
}

interface Cycle {
  id: string; name: string; start_date: string; end_date: string;
  goal: string | null; budget_weeks: string; status: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  planning:  { bg: '#fef9c3', text: '#854d0e' },
  active:    { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
};

export default function CyclePlanningPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterEffort, setFilterEffort] = useState<string>('all');
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleGoal, setNewCycleGoal] = useState('');
  const [newCycleStart, setNewCycleStart] = useState('');
  const [newCycleEnd, setNewCycleEnd] = useState('');

  useEffect(() => {
    void Promise.all([
      fetch('/api/backlog').then(r => r.json() as Promise<BacklogItem[]>),
      fetch('/api/master-projects').then(r => r.json() as Promise<MasterProject[]>),
      fetch('/api/cycles').then(r => r.json() as Promise<Cycle[]>),
    ]).then(([b, p, c]: [BacklogItem[], MasterProject[], Cycle[]]) => {
      setItems(b);
      setProjects(p);
      setCycles(c);
    }).finally(() => setLoaded(true));
  }, []);

  const activeCycle = cycles.find(c => c.status === 'active') ?? cycles.find(c => c.status === 'planning');

  const projectMap: Record<string, MasterProject | undefined> = Object.fromEntries(projects.map(p => [p.id, p]));

  // Items in the backlog (available to plan)
  const backlogItems = items.filter(i => i.status === 'backlog');
  // Items committed to the active cycle
  const plannedItems = items.filter(i => (i.status === 'planned' || i.status === 'in-progress') && i.cycle_id === activeCycle?.id);

  const committedWeeks = plannedItems.reduce((sum, i) => sum + Number(i.effort_weeks), 0);
  const budgetWeeks = activeCycle ? Number(activeCycle.budget_weeks) : 4.5;
  const remainingWeeks = budgetWeeks - committedWeeks;

  // Apply filters
  let filteredBacklog = backlogItems;
  if (filterProject !== 'all') filteredBacklog = filteredBacklog.filter(i => i.project_id === filterProject);
  if (filterEffort !== 'all') filteredBacklog = filteredBacklog.filter(i => i.effort === filterEffort);
  filteredBacklog.sort((a, b) => Number(b.priority) - Number(a.priority));

  async function addToCycle(item: BacklogItem) {
    if (!activeCycle) return;
    const res = await fetch(`/api/backlog/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'planned', cycleId: activeCycle.id }),
    });
    if (res.ok) {
      const updated = (await res.json()) as BacklogItem;
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    }
  }

  async function removeFromCycle(item: BacklogItem) {
    const res = await fetch(`/api/backlog/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'backlog', cycleId: null }),
    });
    if (res.ok) {
      const updated = (await res.json()) as BacklogItem;
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    }
  }

  async function startCycle() {
    if (!activeCycle) return;
    const res = await fetch(`/api/cycles/${activeCycle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Cycle;
      setCycles(prev => prev.map(c => c.id === activeCycle.id ? updated : c));
    }
  }

  async function createCycle() {
    if (!newCycleName.trim() || !newCycleStart || !newCycleEnd) return;
    const nextNum = cycles.length + 1;
    const cycleId = `cycle-${String(nextNum).padStart(2, '0')}`;
    const res = await fetch('/api/cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: cycleId, name: newCycleName.trim(), startDate: newCycleStart,
        endDate: newCycleEnd, goal: newCycleGoal.trim() || null,
      }),
    });
    if (res.ok) {
      const cycle = (await res.json()) as Cycle;
      setCycles(prev => [cycle, ...prev]);
      setShowNewCycle(false);
      setNewCycleName('');
      setNewCycleGoal('');
      setNewCycleStart('');
      setNewCycleEnd('');
    }
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Cycle Planning</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Rank and commit the highest-impact work across all projects for your next 6-week cycle.
      </p>

      {/* Active/Planning Cycle Header */}
      {activeCycle ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
          padding: 20, marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{activeCycle.name}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[activeCycle.status]?.bg, color: (STATUS_COLORS as Record<string, { bg: string; text: string } | undefined>)[activeCycle.status]?.text,
              }}>{activeCycle.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {activeCycle.start_date} &rarr; {activeCycle.end_date}
            </div>
            {activeCycle.goal && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{activeCycle.goal}</div>}
          </div>

          {/* Budget meter */}
          <div style={{ width: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              <span>Committed: <strong>{committedWeeks}w</strong></span>
              <span>Budget: <strong>{budgetWeeks}w</strong></span>
            </div>
            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width 0.3s',
                width: `${Math.min((committedWeeks / budgetWeeks) * 100, 100)}%`,
                background: remainingWeeks < 0 ? '#dc2626' : remainingWeeks < 1 ? '#f59e0b' : '#16a34a',
              }} />
            </div>
            <div style={{ fontSize: 11, color: remainingWeeks < 0 ? '#dc2626' : '#9ca3af', marginTop: 2 }}>
              {remainingWeeks >= 0 ? `${remainingWeeks}w remaining` : `${Math.abs(remainingWeeks)}w over budget`}
            </div>
          </div>

          {activeCycle.status === 'planning' && (
            <button onClick={() => void startCycle()} disabled={plannedItems.length === 0}
              style={{
                padding: '8px 20px', fontSize: 14, fontWeight: 600, color: '#fff',
                background: plannedItems.length === 0 ? '#d1d5db' : '#16a34a',
                border: 'none', borderRadius: 8, cursor: plannedItems.length === 0 ? 'not-allowed' : 'pointer',
              }}>
              Start Cycle
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 12, padding: 24, marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>No active or planning cycle. Create one to start planning.</p>
          <button onClick={() => setShowNewCycle(true)} style={{
            padding: '8px 20px', fontSize: 14, fontWeight: 600, color: '#fff',
            background: '#4f46e5', border: 'none', borderRadius: 8, cursor: 'pointer',
          }}>+ New Cycle</button>
        </div>
      )}

      {showNewCycle && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>New Cycle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name</label>
              <input value={newCycleName} onChange={e => setNewCycleName(e.target.value)} placeholder="e.g. DIS + Promo Hub"
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Start Date</label>
              <input type="date" value={newCycleStart} onChange={e => setNewCycleStart(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>End Date</label>
              <input type="date" value={newCycleEnd} onChange={e => setNewCycleEnd(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Goal (optional)</label>
              <input value={newCycleGoal} onChange={e => setNewCycleGoal(e.target.value)} placeholder="What success looks like"
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => void createCycle()} style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create</button>
            <button onClick={() => setShowNewCycle(false)} style={{ padding: '6px 16px', fontSize: 13, color: '#6b7280', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Left: Ranked Backlog */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Ranked Backlog</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={filterEffort} onChange={e => setFilterEffort(e.target.value)}
                style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option value="all">All Sizes</option>
                {['XS', 'S', 'M', 'L', 'XL'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11, width: 30 }}>#</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Feature</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Project</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Impact</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Effort</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11 }}>Priority</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: 11, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredBacklog.map((item, idx) => {
                const proj = projectMap[item.project_id];
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '8px 6px', fontWeight: 500, color: '#111827' }}>
                      <div>{item.title}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>{item.id}</div>
                    </td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: proj?.color ? `${proj.color}18` : '#f3f4f6',
                        color: proj?.color ?? '#6b7280',
                      }}>{proj?.name ?? item.project_id}</span>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600 }}>{item.impact}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{item.effort}</span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}> ({item.effort_weeks}w)</span>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, fontSize: 14,
                      color: Number(item.priority) >= 3 ? '#166534' : Number(item.priority) >= 1.5 ? '#854d0e' : '#6b7280' }}>
                      {item.priority}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <button onClick={() => void addToCycle(item)} disabled={!activeCycle}
                        title="Add to cycle"
                        style={{
                          fontSize: 16, background: 'none', border: 'none', cursor: activeCycle ? 'pointer' : 'not-allowed',
                          color: activeCycle ? '#4f46e5' : '#d1d5db',
                        }}>+</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredBacklog.length === 0 && (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>
              No backlog items match filters. Add items from Master Plans.
            </p>
          )}
        </div>

        {/* Right: Cycle Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, position: 'sticky', top: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            {activeCycle ? 'Committed Work' : 'No Cycle Selected'}
          </h2>

          {activeCycle && (
            <>
              {plannedItems.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Click + on backlog items to add them to this cycle.</p>
              ) : (
                <div>
                  {plannedItems.map(item => {
                    const proj = projectMap[item.project_id];
                    return (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                        borderBottom: '1px solid #f3f4f6',
                      }}>
                        <div style={{ width: 4, height: 28, borderRadius: 2, background: proj?.color ?? '#9ca3af', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.effort} ({item.effort_weeks}w) &middot; Priority {item.priority}</div>
                        </div>
                        <button onClick={() => void removeFromCycle(item)} title="Remove from cycle"
                          style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, flexShrink: 0 }}>&#10005;</button>
                      </div>
                    );
                  })}

                  <div style={{ marginTop: 12, padding: '12px 0 0', borderTop: '2px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <span>{plannedItems.length} item{plannedItems.length !== 1 ? 's' : ''}</span>
                    <span style={{ color: remainingWeeks < 0 ? '#dc2626' : '#111827' }}>
                      {committedWeeks}w / {budgetWeeks}w
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
