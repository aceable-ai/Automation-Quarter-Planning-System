'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Q2C2_INVENTORY,
  SECTION_COLORS,
  type InventoryEntry,
} from '@/lib/q2c2-inventory';

interface MasterPlan {
  id: string;
  name: string;
}

interface InventoryLink {
  inventory_name: string;
  master_plan_id: string;
}

export function InventoryTable() {
  const [plans, setPlans] = useState<MasterPlan[]>([]);
  const [linkMap, setLinkMap] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPlanId, setBulkPlanId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingNames, setSavingNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/master-projects').then(r => r.json()),
      fetch('/api/inventory-links').then(r => r.json()),
    ])
      .then(([planRows, linkRows]) => {
        setPlans(
          (planRows as { id: string; name: string }[]).map(p => ({ id: p.id, name: p.name }))
        );
        const m: Record<string, string> = {};
        for (const link of linkRows as InventoryLink[]) {
          m[link.inventory_name] = link.master_plan_id;
        }
        setLinkMap(m);
      })
      .catch((err: unknown) => console.error('[inventory-table load]', err))
      .finally(() => setLoading(false));
  }, []);

  const planById = useMemo(() => {
    const m: Record<string, MasterPlan> = {};
    for (const p of plans) m[p.id] = p;
    return m;
  }, [plans]);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.name.localeCompare(b.name)),
    [plans]
  );

  function setLinkLocal(name: string, planId: string | null) {
    setLinkMap(prev => {
      if (planId === null) {
        const { [name]: _omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: planId };
    });
  }

  async function saveLink(name: string, planId: string | null) {
    setSavingNames(prev => new Set(prev).add(name));
    try {
      const res = await fetch('/api/inventory-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryName: name, masterPlanId: planId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLinkLocal(name, planId);
    } catch (err) {
      console.error('[saveLink]', err);
      toast.error(`Failed to save link for ${name}`);
    } finally {
      setSavingNames(prev => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  }

  async function bulkApply() {
    if (selected.size === 0) return;
    const planId = bulkPlanId === '__none__' ? null : bulkPlanId || null;
    if (bulkPlanId === '') return;

    const names = Array.from(selected);
    try {
      const res = await fetch('/api/inventory-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names, masterPlanId: planId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      for (const n of names) setLinkLocal(n, planId);
      setSelected(new Set());
      setBulkPlanId('');
    } catch (err) {
      console.error('[bulkApply]', err);
      toast.error('Bulk link failed');
    }
  }

  function toggleSelect(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === Q2C2_INVENTORY.length) setSelected(new Set());
    else setSelected(new Set(Q2C2_INVENTORY.map(e => e.name)));
  }

  return (
    <div>
      {selected.size > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#0f172a',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 6,
            marginBottom: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            fontSize: 13,
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <span style={{ color: '#94a3b8' }}>Link to:</span>
          <select
            value={bulkPlanId}
            onChange={e => setBulkPlanId(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              borderRadius: 4,
              padding: '6px 8px',
              fontSize: 13,
            }}
          >
            <option value="">— pick a master plan —</option>
            <option value="__none__">— Unlink all selected —</option>
            {sortedPlans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => { void bulkApply(); }}
            disabled={!bulkPlanId}
            style={{
              background: bulkPlanId ? '#22c55e' : '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: bulkPlanId ? 'pointer' : 'not-allowed',
            }}
          >
            Apply
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: 'none',
              fontSize: 13,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            Clear
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={thStyle}>
                <input
                  type="checkbox"
                  checked={selected.size === Q2C2_INVENTORY.length && Q2C2_INVENTORY.length > 0}
                  ref={el => {
                    if (el) el.indeterminate = selected.size > 0 && selected.size < Q2C2_INVENTORY.length;
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th style={thStyle}>Section</th>
              <th style={thStyle}>Name</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Hrs/mo</th>
              <th style={thStyle}>Tool</th>
              <th style={thStyle}>Owner</th>
              <th style={thStyle}>Master Plan</th>
            </tr>
          </thead>
          <tbody>
            {Q2C2_INVENTORY.map(e => (
              <Row
                key={e.name}
                entry={e}
                linkedPlanId={linkMap[e.name] ?? null}
                planById={planById}
                sortedPlans={sortedPlans}
                checked={selected.has(e.name)}
                onToggle={() => toggleSelect(e.name)}
                onLinkChange={planId => { void saveLink(e.name, planId); }}
                saving={savingNames.has(e.name)}
                loading={loading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  entry,
  linkedPlanId,
  planById,
  sortedPlans,
  checked,
  onToggle,
  onLinkChange,
  saving,
  loading,
}: {
  entry: InventoryEntry;
  linkedPlanId: string | null;
  planById: Record<string, MasterPlan>;
  sortedPlans: MasterPlan[];
  checked: boolean;
  onToggle: () => void;
  onLinkChange: (planId: string | null) => void;
  saving: boolean;
  loading: boolean;
}) {
  const linkedPlan = linkedPlanId ? planById[linkedPlanId] : null;

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9', background: checked ? '#f1f5f9' : undefined }}>
      <td style={tdStyle}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </td>
      <td style={tdStyle}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: 2,
            background: SECTION_COLORS[entry.section],
            marginRight: 8,
          }}
        />
        {entry.section}
      </td>
      <td style={tdStyle}>{entry.name}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{entry.hoursPerMonth ?? '—'}</td>
      <td style={tdStyle}>{entry.tool}</td>
      <td style={tdStyle}>{entry.owner}</td>
      <td style={tdStyle}>
        {loading ? (
          <span style={{ color: '#94a3b8' }}>…</span>
        ) : linkedPlan ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              href={`/master-plans/${linkedPlan.id}`}
              style={{ color: '#4070b5', textDecoration: 'underline', fontWeight: 500 }}
            >
              {linkedPlan.name}
            </Link>
            <button
              onClick={() => onLinkChange(null)}
              disabled={saving}
              title="Unlink"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: saving ? 'wait' : 'pointer',
                fontSize: 14,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <select
            value=""
            disabled={saving}
            onChange={e => {
              const v = e.target.value;
              if (v === '__create__') {
                window.location.href = '/master-plans/submit';
                return;
              }
              if (v) onLinkChange(v);
            }}
            style={{
              fontSize: 12,
              padding: '4px 6px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              minWidth: 160,
            }}
          >
            <option value="">— link to plan —</option>
            {sortedPlans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="__create__">+ Create new master plan…</option>
          </select>
        )}
      </td>
    </tr>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 12, fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '10px 8px', color: '#0f172a' };
