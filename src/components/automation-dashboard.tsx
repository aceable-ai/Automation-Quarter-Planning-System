"use client";

import { useState, useRef } from "react";
import { arch, type Track, type Project, type Initiative } from "@/lib/automation-data";

type StatusColor = "green" | "blue" | "red";

const HL = "#4f46e5";

const STATUS: Record<StatusColor, { bg: string; border: string; label: string; hex: string }> = {
  green: { bg: "#f0fdf4", border: "#16a34a", label: "DR Agreed",        hex: "#16a34a" },
  blue:  { bg: "#eff6ff", border: "#2563eb", label: "Suggesting to DR", hex: "#2563eb" },
  red:   { bg: "#fef2f2", border: "#dc2626", label: "Won't Do",         hex: "#dc2626" },
};

const IMP: Record<string, { bg: string; text: string; border: string }> = {
  High:       { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  "Med-High": { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  Medium:     { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  Low:        { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" },
};

const COLS = ["In Progress", "Q1 2026", "Q2 2026", "Q3+ 2026", "Backlog"];

function bucket(q: string): string {
  if (!q) return "Backlog";
  if (COLS.includes(q)) return q;
  const l = q.toLowerCase();
  if (l.includes("progress")) return "In Progress";
  if (["ice box", "icebox", "tbd", "later"].includes(l)) return "Backlog";
  if (l.includes("q1") && !l.includes("q2")) return "Q1 2026";
  if (l.includes("q2")) return "Q2 2026";
  if (l.includes("q3")) return "Q3+ 2026";
  return "Backlog";
}

// ── Editable title ────────────────────────────────────────────────────────────

function EditableTitle({
  value, onSave, style,
}: {
  value: string; onSave: (v: string) => void; style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    setEditing(false);
    const t = draft.trim();
    if (t && t !== value) onSave(t);
    else setDraft(value);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        onClick={e => e.stopPropagation()}
        style={{ ...style, border: "1.5px solid #4f46e5", borderRadius: 4, padding: "1px 6px", outline: "none", background: "#fff", flex: 1, minWidth: 0 }}
      />
    );
  }

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
      <span style={{ ...style, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{value}</span>
      <span
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); setDraft(value); setEditing(true); }}
        title="Rename"
        style={{ fontSize: 10, opacity: 0.3, cursor: "pointer", flexShrink: 0, userSelect: "none" as const }}
      >✎</span>
    </span>
  );
}

// ── Color bar ─────────────────────────────────────────────────────────────────

function ColorBar({
  brush, setBrush, selCount, onBulk,
}: {
  brush: StatusColor | null;
  setBrush: (c: StatusColor | null) => void;
  selCount: number;
  onBulk: (c: StatusColor | null) => void;
}) {
  function click(c: StatusColor | null) {
    if (selCount > 0) { onBulk(c); return; }
    setBrush(brush === c ? null : c);
  }

  return (
    <div style={{
      position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)",
      zIndex: 200, display: "flex", flexDirection: "column" as const,
      alignItems: "center", gap: 10, background: "#fff",
      border: "1px solid #e5e7eb", borderRadius: 14,
      padding: "14px 10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      userSelect: "none" as const,
    }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: "#aaa", letterSpacing: 0.8, textTransform: "uppercase" as const }}>DR Status</span>
      {selCount > 0 && (
        <span style={{ fontSize: 9, color: "#4f46e5", background: "#eff0ff", borderRadius: 4, padding: "2px 5px", fontWeight: 600 }}>
          {selCount} sel.
        </span>
      )}
      {(["green", "blue", "red"] as StatusColor[]).map(c => (
        <button
          key={c}
          onClick={() => click(c)}
          title={STATUS[c].label}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: STATUS[c].hex,
            border: brush === c ? "3px solid #111" : "3px solid transparent",
            boxShadow: brush === c ? `0 0 0 2px #fff, 0 0 0 4px ${STATUS[c].hex}` : "0 1px 3px rgba(0,0,0,0.15)",
            cursor: "pointer", outline: "none", transition: "all 0.12s",
          }}
        />
      ))}
      <button
        onClick={() => click(null)}
        title="Clear status"
        style={{
          width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6",
          border: "2px solid #d1d5db", cursor: "pointer", outline: "none",
          fontSize: 13, color: "#9ca3af", display: "flex",
          alignItems: "center", justifyContent: "center", transition: "all 0.12s",
        }}
      >✕</button>
      <div style={{ width: 24, borderTop: "1px solid #f0f0f0" }} />
      {(["green", "blue", "red"] as StatusColor[]).map(c => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS[c].hex, flexShrink: 0 }} />
          <span style={{ fontSize: 8, color: "#888", lineHeight: 1.3 }}>{STATUS[c].label}</span>
        </div>
      ))}
      <span style={{ fontSize: 8, color: "#bbb", textAlign: "center" as const, lineHeight: 1.5, marginTop: 2 }}>
        {selCount > 0 ? "tap to\napply" : brush ? "tap cards\nto color" : "pick color\nto paint"}
      </span>
    </div>
  );
}

// ── Initiative row ────────────────────────────────────────────────────────────

function InitRow({ init, tc }: { init: Initiative; tc: string }) {
  return (
    <div style={{
      padding: "7px 12px",
      borderLeft: init.f ? `3px solid ${tc}` : "3px solid #e0e0e0",
      marginBottom: 3, background: init.f ? `${tc}1A` : "transparent",
      borderRadius: "0 6px 6px 0", display: "flex",
      alignItems: "center", gap: 8, flexWrap: "wrap" as const,
    }}>
      <span style={{ fontSize: 12, color: "#444", flex: 1, minWidth: 0 }}>{init.n}</span>
      {init.j && <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0 }}>{init.j}</span>}
      {init.s > 0 && <span style={{ fontSize: 11, color: "#999", flexShrink: 0 }}>{init.s}</span>}
      {init.f && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: tc, color: "#fff", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" as const }}>{init.f}</span>}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListProjectRow({
  sys, track, openSys, setOS,
  displayName, onRename, displayQ,
  status, isSelected, onCardClick,
}: {
  sys: Project; track: Track;
  openSys: string | null; setOS: (v: string | null) => void;
  displayName: string; onRename: (v: string) => void; displayQ: string;
  status: StatusColor | undefined; isSelected: boolean; onCardClick: () => void;
}) {
  const sOpen = openSys === sys.n;
  const sc = status ? STATUS[status] : null;
  const imp = IMP[sys.imp];

  return (
    <div style={{ marginTop: 8 }}>
      <div
        onClick={onCardClick}
        style={{
          padding: "10px 12px",
          background: sc ? sc.bg : "#f9f9f9",
          borderRadius: 8, cursor: "pointer", userSelect: "none" as const,
          border: isSelected ? "2px solid #4f46e5"
               : sc ? `2px solid ${sc.border}`
               : "1px solid transparent",
          transition: "border 0.1s, background 0.1s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
          <div style={{
            width: 15, height: 15, borderRadius: 3, flexShrink: 0,
            border: `2px solid ${isSelected ? "#4f46e5" : "#d1d5db"}`,
            background: isSelected ? "#4f46e5" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.1s",
          }}>
            {isSelected && <span style={{ fontSize: 8, color: "#fff", fontWeight: 800 }}>✓</span>}
          </div>
          <span
            onClick={e => { e.stopPropagation(); setOS(sOpen ? null : sys.n); }}
            style={{ fontSize: 11, color: "#aaa", cursor: "pointer", flexShrink: 0 }}
          >{sOpen ? "▼" : "▶"}</span>
          {sc && <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.border, flexShrink: 0 }} />}
          <EditableTitle
            value={displayName} onSave={onRename}
            style={{ fontSize: 13, fontWeight: 600, color: isSelected ? HL : "#222" }}
          />
          {sys.i.length > 0 && <span style={{ fontSize: 11, color: "#999" }}>({sys.i.length})</span>}
          {sys.imp && imp && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: imp.bg, color: imp.text, border: `1px solid ${imp.border}`, fontWeight: 600 }}>
              {sys.imp}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, flexShrink: 0, color: sc ? sc.border : "#999", fontWeight: sc ? 600 : 400 }}>
            {displayQ}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, marginLeft: 23 }}>Captain: {sys.cap}</div>
      </div>
      {sOpen && (
        <div style={{ marginLeft: 23, marginTop: 6 }}>
          <div style={{ padding: "10px 12px", marginBottom: 8, background: "#fafafa", borderRadius: 8, borderLeft: `3px solid ${track.c}`, fontSize: 12, lineHeight: 1.6, color: "#555" }}>
            {sys.p}
          </div>
          {sys.i.length > 0
            ? sys.i.map((init, i) => <InitRow key={i} init={init} tc={track.c} />)
            : <div style={{ padding: "8px 12px", fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Project-level work only — no tasks mapped yet</div>
          }
        </div>
      )}
    </div>
  );
}

function ListTrackRow({
  tr, openTrack, setOT, openSys, setOS,
  names, quarters, colors, selected, onCardClick, onRename, impactFilter,
}: {
  tr: Track; openTrack: string | null; setOT: (v: string | null) => void;
  openSys: string | null; setOS: (v: string | null) => void;
  names: Record<string, string>; quarters: Record<string, string>;
  colors: Record<string, StatusColor>; selected: Set<string>;
  onCardClick: (n: string) => void; onRename: (n: string, v: string) => void;
  impactFilter: string;
}) {
  const isOpen = openTrack === tr.t;
  const visibleSystems = impactFilter === "All"
    ? tr.s
    : tr.s.filter(s => s.imp === impactFilter);
  const ic = tr.s.reduce((a, s) => a + s.i.length, 0);

  if (visibleSystems.length === 0) return null;

  return (
    <div style={{ border: "1px solid #e2e2e2", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <div
        onClick={() => { setOT(isOpen ? null : tr.t); setOS(null); }}
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, borderLeft: `4px solid ${tr.c}`, userSelect: "none" as const }}
      >
        <span style={{ fontSize: 12, color: "#999" }}>{isOpen ? "▼" : "▶"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: tr.c }}>{tr.t}</span>
            <span style={{ fontSize: 11, color: "#888", background: "#f5f5f5", padding: "2px 8px", borderRadius: 4 }}>
              {impactFilter === "All" ? `${tr.s.length} projects` : `${visibleSystems.length} of ${tr.s.length} projects`} · {ic} tasks
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{tr.d}</div>
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: "0 16px 12px 20px", borderLeft: `4px solid ${tr.c}` }}>
          {visibleSystems.map(sys => (
            <ListProjectRow
              key={sys.n} sys={sys} track={tr}
              openSys={openSys} setOS={setOS}
              displayName={names[sys.n] ?? sys.n}
              onRename={v => onRename(sys.n, v)}
              displayQ={quarters[sys.n] ?? sys.q}
              status={colors[sys.n]}
              isSelected={selected.has(sys.n)}
              onCardClick={() => onCardClick(sys.n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Kanban view ───────────────────────────────────────────────────────────────

function KanbanCard({
  sys, track, displayName, onRename,
  status, isSelected, onCardClick, onDragStart,
}: {
  sys: Project; track: Track;
  displayName: string; onRename: (v: string) => void;
  status: StatusColor | undefined; isSelected: boolean;
  onCardClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = status ? STATUS[status] : null;
  const imp = IMP[sys.imp];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onCardClick}
      style={{
        padding: "10px 12px", borderRadius: 8,
        background: sc ? sc.bg : "#fff",
        border: isSelected ? "2px solid #4f46e5"
             : sc ? `2px solid ${sc.border}`
             : "1px solid #e2e2e2",
        cursor: "grab", userSelect: "none" as const,
        transition: "border 0.1s, background 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <div style={{
          width: 13, height: 13, borderRadius: 3, flexShrink: 0,
          border: `2px solid ${isSelected ? "#4f46e5" : "#d1d5db"}`,
          background: isSelected ? "#4f46e5" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isSelected && <span style={{ fontSize: 7, color: "#fff", fontWeight: 800 }}>✓</span>}
        </div>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: track.c, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: "#999", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{track.t}</span>
        {sc && <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.border, flexShrink: 0 }} />}
      </div>
      <EditableTitle
        value={displayName} onSave={onRename}
        style={{ fontSize: 12, fontWeight: 600, color: isSelected ? HL : "#222", lineHeight: 1.4 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" as const }}>
        {sys.imp && imp && (
          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: imp.bg, color: imp.text, border: `1px solid ${imp.border}`, fontWeight: 600 }}>
            {sys.imp}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#aaa" }}>{sys.i.length} tasks</span>
        <span style={{ fontSize: 10, color: "#bbb", marginLeft: "auto" }}>{sys.cap}</span>
        {sys.i.length > 0 && (
          <span
            onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
            style={{ fontSize: 9, color: "#bbb", cursor: "pointer" }}
          >{expanded ? "▲" : "▼"}</span>
        )}
      </div>
      {expanded && (
        <div style={{ marginTop: 8, borderTop: "1px solid #eee", paddingTop: 6 }}>
          {sys.i.map((task, i) => (
            <div key={i} style={{ fontSize: 11, color: "#555", padding: "3px 0", display: "flex", gap: 6 }}>
              <span style={{ color: "#ccc" }}>•</span>
              <span style={{ flex: 1 }}>{task.n}</span>
              {task.s > 0 && <span style={{ color: "#bbb", flexShrink: 0 }}>{task.s}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  col, items, names, colors, selected,
  onCardClick, onRename, onDragStart, onDragEnter, onDrop, isOver,
}: {
  col: string;
  items: { sys: Project; track: Track }[];
  names: Record<string, string>;
  colors: Record<string, StatusColor>; selected: Set<string>;
  onCardClick: (n: string) => void; onRename: (n: string, v: string) => void;
  onDragStart: (e: React.DragEvent, n: string) => void;
  onDragEnter: (col: string) => void;
  onDrop: (e: React.DragEvent, col: string) => void;
  isOver: boolean;
}) {
  return (
    <div
      style={{ minWidth: 210, maxWidth: 230, flex: "0 0 auto" }}
      onDragOver={e => { e.preventDefault(); onDragEnter(col); }}
      onDrop={e => onDrop(e, col)}
    >
      <div style={{
        padding: "8px 10px", marginBottom: 8, borderRadius: 8,
        background: isOver ? "#eff0ff" : "#f5f5f5",
        border: isOver ? "2px dashed #4f46e5" : "2px solid transparent",
        transition: "all 0.1s",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: isOver ? "#4f46e5" : "#222" }}>{col}</span>
        <span style={{ fontSize: 11, color: "#999", marginLeft: 6 }}>({items.length})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
        {items.map(({ sys, track }) => (
          <KanbanCard
            key={sys.n} sys={sys} track={track}
            displayName={names[sys.n] ?? sys.n}
            onRename={v => onRename(sys.n, v)}
            status={colors[sys.n]}
            isSelected={selected.has(sys.n)}
            onCardClick={() => onCardClick(sys.n)}
            onDragStart={e => onDragStart(e, sys.n)}
          />
        ))}
        {items.length === 0 && (
          <div style={{
            padding: 16, fontSize: 12, color: isOver ? "#4f46e5" : "#ccc",
            fontStyle: "italic", textAlign: "center" as const,
            border: `2px dashed ${isOver ? "#4f46e5" : "#e8e8e8"}`,
            borderRadius: 8, background: isOver ? "#fafbff" : "transparent",
            transition: "all 0.1s",
          }}>
            {isOver ? "Drop here" : "No projects"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AutomationDashboard() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [openTrack, setOT] = useState<string | null>(null);
  const [openSys, setOS] = useState<string | null>(null);

  const [names, setNames] = useState<Record<string, string>>({});
  const [quarters, setQuarters] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<Record<string, StatusColor>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [brush, setBrush] = useState<StatusColor | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<string>("All");

  const dragNameRef = useRef<string | null>(null);

  const ct = {
    ts: arch.reduce((a, tr) => a + tr.s.length, 0),
    ii: arch.reduce((a, tr) => a + tr.s.reduce((b, s) => b + s.i.length, 0), 0),
  };
  const greenCount = Object.values(colors).filter(c => c === "green").length;
  const blueCount  = Object.values(colors).filter(c => c === "blue").length;

  function handleCardClick(originalName: string) {
    if (brush) {
      setColors(prev => {
        if (prev[originalName] === brush) {
          return Object.fromEntries(Object.entries(prev).filter(([k]) => k !== originalName));
        }
        return { ...prev, [originalName]: brush };
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(originalName)) next.delete(originalName);
        else next.add(originalName);
        return next;
      });
    }
  }

  function handleRename(originalName: string, newName: string) {
    setNames(prev => ({ ...prev, [originalName]: newName }));
  }

  function handleBulkColor(c: StatusColor | null) {
    setColors(prev => {
      if (c === null) {
        return Object.fromEntries(Object.entries(prev).filter(([k]) => !selected.has(k)));
      }
      const additions = Object.fromEntries([...selected].map(n => [n, c]));
      return { ...prev, ...additions };
    });
    setSelected(new Set());
  }

  function handleDragStart(e: React.DragEvent, name: string) {
    dragNameRef.current = name;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", name);
  }

  function handleDrop(e: React.DragEvent, col: string) {
    e.preventDefault();
    setDragOverCol(null);
    const name = e.dataTransfer.getData("text/plain") || dragNameRef.current;
    if (!name) return;
    dragNameRef.current = null;
    setQuarters(prev => ({ ...prev, [name]: col }));
  }

  // Build kanban columns
  const kanbanData: Record<string, { sys: Project; track: Track }[]> =
    Object.fromEntries(COLS.map(c => [c, []]));
  for (const track of arch) {
    for (const sys of track.s) {
      const q = quarters[sys.n] ?? sys.q;
      const col = bucket(q);
      kanbanData[col]?.push({ sys, track });
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 960, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111" }}>Ace Automation Initiatives</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
          {arch.length} tracks · {ct.ts} projects · {ct.ii} tasks
          {blueCount > 0 && (
            <> · <span style={{ color: STATUS.blue.hex, fontWeight: 600 }}>{blueCount} suggested topic{blueCount !== 1 ? "s" : ""}</span></>
          )}
          {greenCount > 0 && (
            <> · <span style={{ color: STATUS.green.border, fontWeight: 600 }}>{greenCount} potential OKR{greenCount !== 1 ? "s" : ""}</span></>
          )}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", gap: 4 }}>
            {(["list", "kanban"] as const).map(v => (
              <button
                key={v} onClick={() => setView(v)}
                style={{
                  padding: "5px 14px", borderRadius: 6, cursor: "pointer",
                  border: view === v ? "2px solid #333" : "1px solid #ddd",
                  background: view === v ? "#222" : "transparent",
                  color: view === v ? "#fff" : "#555",
                  fontSize: 12, fontWeight: view === v ? 600 : 400,
                }}
              >{v === "list" ? "List View" : "Kanban"}</button>
            ))}
          </div>
          {selected.size > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600 }}>{selected.size} selected</span>
              <button
                onClick={() => setSelected(new Set())}
                style={{ fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" as const }}>
            {["All", "High", "Med-High", "Medium", "Low"].map(level => {
              const imp = IMP[level];
              const isActive = impactFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => setImpactFilter(level)}
                  style={{
                    padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    border: isActive
                      ? `1.5px solid ${imp ? imp.text : "#111"}`
                      : "1px solid #ddd",
                    background: isActive
                      ? (imp ? imp.bg : "#222")
                      : "#fff",
                    color: isActive
                      ? (imp ? imp.text : "#fff")
                      : "#555",
                    transition: "all 0.1s",
                  }}
                >
                  {level === "All" ? "All impact" : level}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {arch.map(tr => (
              <ListTrackRow
                key={tr.t} tr={tr}
                openTrack={openTrack} setOT={setOT}
                openSys={openSys} setOS={setOS}
                names={names} quarters={quarters} colors={colors} selected={selected}
                onCardClick={handleCardClick} onRename={handleRename}
                impactFilter={impactFilter}
              />
            ))}
          </div>
        </>
      )}

      {/* Kanban view */}
      {view === "kanban" && (
        <div
          style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12 }}
          onDragEnd={() => { setDragOverCol(null); dragNameRef.current = null; }}
        >
          {COLS.map(col => (
            <KanbanColumn
              key={col} col={col}
              items={kanbanData[col] ?? []}
              names={names} colors={colors} selected={selected}
              onCardClick={handleCardClick} onRename={handleRename}
              onDragStart={handleDragStart}
              onDragEnter={setDragOverCol}
              onDrop={handleDrop}
              isOver={dragOverCol === col}
            />
          ))}
        </div>
      )}

      <ColorBar
        brush={brush} setBrush={setBrush}
        selCount={selected.size} onBulk={handleBulkColor}
      />
    </div>
  );
}
