"use client";

import { useState, useRef, useEffect } from "react";
import { arch, type Track, type Project, type Initiative } from "@/lib/automation-data";

type StatusColor = "green" | "blue" | "red";

interface Comment {
  id: string;
  project_name: string;
  author: string;
  content: string;
  vetted: boolean;
  created_at: string;
}

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

const IMP_ORDER = ["High", "Med-High", "Medium", "Low", ""];

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

// ── Editable description ──────────────────────────────────────────────────────

function EditableDesc({ value, onSave, trackColor }: { value: string; onSave: (v: string) => void; trackColor: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); onSave(draft); }}
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          padding: "8px 12px", fontSize: 12, lineHeight: 1.6, color: "#333",
          borderRadius: 8, border: `1.5px solid ${trackColor}`, resize: "vertical" as const, outline: "none",
        }}
      />
    );
  }
  return (
    <div
      onClick={() => { setEditing(true); setDraft(value); }}
      title="Click to edit description"
      style={{
        padding: "10px 12px", background: "#fafafa", borderRadius: 8,
        borderLeft: `3px solid ${trackColor}`, fontSize: 12, lineHeight: 1.6,
        color: value ? "#555" : "#bbb", cursor: "text", fontStyle: value ? "normal" : "italic",
      }}
    >
      {value || "Click to add description…"}
    </div>
  );
}

// ── Comment section ───────────────────────────────────────────────────────────

function CommentSection({ comments, onAdd }: { comments: Comment[]; onAdd: (content: string, author: string) => void }) {
  const [draft, setDraft] = useState("");
  const [author, setAuthor] = useState(() => {
    try { return localStorage.getItem("aqps:author") ?? ""; } catch { return ""; }
  });

  function submit() {
    if (!draft.trim()) return;
    const a = author.trim() || "Anonymous";
    onAdd(draft.trim(), a);
    try { localStorage.setItem("aqps:author", a); } catch { /* ignore */ }
    setDraft("");
  }

  return (
    <div style={{ marginTop: 12, padding: "10px 12px", background: "#f5f5ff", borderRadius: 8, border: "1px solid #e0e0f0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
        Comments {comments.length > 0 && `(${comments.length})`}
      </div>
      {comments.length === 0 && (
        <div style={{ fontSize: 12, color: "#bbb", fontStyle: "italic", marginBottom: 10 }}>No comments yet</div>
      )}
      {comments.map(c => (
        <div key={c.id} style={{ marginBottom: 8, padding: "6px 10px", background: "#fff", borderRadius: 6, border: "1px solid #e8e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{c.author}</span>
            {c.vetted && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#dcfce7", color: "#16a34a", fontWeight: 700 }}>Vetted</span>}
            <span style={{ fontSize: 10, color: "#bbb", marginLeft: "auto" }}>
              {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5, whiteSpace: "pre-wrap" as const }}>{c.content}</div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Your name"
          style={{ width: 110, padding: "5px 8px", fontSize: 11, borderRadius: 6, border: "1px solid #ddd", outline: "none" }}
        />
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Add a comment… (Enter to post)"
          rows={2}
          style={{ flex: 1, padding: "5px 8px", fontSize: 12, borderRadius: 6, border: "1px solid #ddd", outline: "none", resize: "none" as const }}
        />
        <button
          onClick={submit}
          style={{ padding: "0 12px", borderRadius: 6, background: "#4f46e5", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", alignSelf: "flex-end", height: 30 }}
        >Post</button>
      </div>
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListProjectRow({
  sys, track, openSys, setOS,
  displayName, onRename, displayQ,
  status, isSelected, onCardClick,
  displayImp, onImpCycle,
  description, onDescSave, tasks, onTaskAdd, onTaskRemove,
  projectComments, commentsOpen, onCommentsToggle, onCommentAdd,
}: {
  sys: Project; track: Track;
  openSys: string | null; setOS: (v: string | null) => void;
  displayName: string; onRename: (v: string) => void; displayQ: string;
  status: StatusColor | undefined; isSelected: boolean; onCardClick: () => void;
  displayImp: string; onImpCycle: () => void;
  description: string; onDescSave: (v: string) => void;
  tasks: Initiative[]; onTaskAdd: (name: string) => void; onTaskRemove: (name: string) => void;
  projectComments: Comment[]; commentsOpen: boolean;
  onCommentsToggle: () => void; onCommentAdd: (content: string, author: string) => void;
}) {
  const sOpen = openSys === sys.n;
  const sc = status ? STATUS[status] : null;
  const imp = IMP[displayImp];
  const [addingTask, setAddingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");

  function submitTask() {
    if (!taskDraft.trim()) return;
    onTaskAdd(taskDraft.trim());
    setTaskDraft("");
    setAddingTask(false);
  }

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
          {tasks.length > 0 && <span style={{ fontSize: 11, color: "#999" }}>({tasks.length})</span>}
          <span
            onClick={e => { e.stopPropagation(); onImpCycle(); }}
            title="Click to change impact"
            style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 600, cursor: "pointer", flexShrink: 0,
              ...(imp
                ? { background: imp.bg, color: imp.text, border: `1px solid ${imp.border}` }
                : { background: "#f9f9f9", color: "#ccc", border: "1px dashed #ddd" }
              ),
            }}
          >{displayImp || "+ impact"}</span>
          {/* Comment button */}
          <span
            onClick={e => { e.stopPropagation(); onCommentsToggle(); }}
            title="Comments"
            style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 4, cursor: "pointer", flexShrink: 0,
              background: projectComments.length > 0 ? "#ede9fe" : "#f5f5f5",
              color: projectComments.length > 0 ? "#4f46e5" : "#bbb",
              border: `1px solid ${projectComments.length > 0 ? "#c4b5fd" : "#e5e5e5"}`,
              fontWeight: projectComments.length > 0 ? 600 : 400,
            }}
          >💬 {projectComments.length > 0 ? projectComments.length : "comment"}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, flexShrink: 0, color: sc ? sc.border : "#999", fontWeight: sc ? 600 : 400 }}>
            {displayQ}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, marginLeft: 23 }}>Captain: {sys.cap}</div>
      </div>

      {sOpen && (
        <div style={{ marginLeft: 23, marginTop: 6 }}>
          {/* Editable description */}
          <div style={{ marginBottom: 8 }}>
            <EditableDesc value={description} onSave={onDescSave} trackColor={track.c} />
          </div>

          {/* Tasks with remove buttons */}
          {tasks.length > 0
            ? tasks.map((init, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1 }}><InitRow init={init} tc={track.c} /></div>
                  <button
                    onClick={() => onTaskRemove(init.n)}
                    title="Remove task"
                    style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: "0 4px", flexShrink: 0, lineHeight: 1 }}
                  >×</button>
                </div>
              ))
            : <div style={{ padding: "8px 12px", fontSize: 12, color: "#bbb", fontStyle: "italic" }}>No tasks yet — add one below</div>
          }

          {/* Add task */}
          {addingTask ? (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                autoFocus
                value={taskDraft}
                onChange={e => setTaskDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") submitTask(); if (e.key === "Escape") { setAddingTask(false); setTaskDraft(""); } }}
                placeholder="Task name (Enter to add)"
                style={{ flex: 1, padding: "4px 8px", fontSize: 12, borderRadius: 6, border: "1px solid #ddd", outline: "none" }}
              />
              <button onClick={submitTask} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 6, background: track.c, color: "#fff", border: "none", cursor: "pointer" }}>Add</button>
              <button onClick={() => { setAddingTask(false); setTaskDraft(""); }} style={{ fontSize: 11, background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              style={{ marginTop: 6, fontSize: 11, color: track.c, background: "none", border: `1px dashed ${track.c}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", opacity: 0.7 }}
            >＋ Add task</button>
          )}
        </div>
      )}

      {/* Inline comments (shown regardless of sOpen) */}
      {commentsOpen && (
        <div style={{ marginLeft: 23, marginTop: 6 }}>
          <CommentSection comments={projectComments} onAdd={onCommentAdd} />
        </div>
      )}
    </div>
  );
}

function ListTrackRow({
  tr, openTrack, setOT, openSys, setOS,
  names, quarters, colors, impacts, selected, onCardClick, onRename, onImpactCycle, impactFilter,
  descriptions, taskOverrides, comments, commentsOpen,
  onCommentsToggle, onCommentAdd, onDescSave, onTaskAdd, onTaskRemove,
}: {
  tr: Track; openTrack: string | null; setOT: (v: string | null) => void;
  openSys: string | null; setOS: (v: string | null) => void;
  names: Record<string, string>; quarters: Record<string, string>;
  colors: Record<string, StatusColor>; impacts: Record<string, string>; selected: Set<string>;
  onCardClick: (n: string) => void; onRename: (n: string, v: string) => void;
  onImpactCycle: (n: string, cur: string) => void; impactFilter: string;
  descriptions: Record<string, string>; taskOverrides: Record<string, Initiative[]>;
  comments: Comment[]; commentsOpen: Record<string, boolean>;
  onCommentsToggle: (n: string) => void; onCommentAdd: (pn: string, content: string, author: string) => void;
  onDescSave: (n: string, v: string) => void;
  onTaskAdd: (n: string, name: string) => void; onTaskRemove: (n: string, taskName: string) => void;
}) {
  const isOpen = openTrack === tr.t;
  const visibleSystems = impactFilter === "All"
    ? tr.s
    : tr.s.filter(s => (impacts[s.n] ?? s.imp) === impactFilter);
  const ic = tr.s.reduce((a, s) => a + (taskOverrides[s.n] ?? s.i).length, 0);

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
              displayImp={impacts[sys.n] ?? sys.imp}
              onImpCycle={() => onImpactCycle(sys.n, impacts[sys.n] ?? sys.imp)}
              description={descriptions[sys.n] ?? sys.p}
              onDescSave={v => onDescSave(sys.n, v)}
              tasks={taskOverrides[sys.n] ?? sys.i}
              onTaskAdd={name => onTaskAdd(sys.n, name)}
              onTaskRemove={taskName => onTaskRemove(sys.n, taskName)}
              projectComments={comments.filter(c => c.project_name === sys.n)}
              commentsOpen={commentsOpen[sys.n] ?? false}
              onCommentsToggle={() => onCommentsToggle(sys.n)}
              onCommentAdd={(content, author) => onCommentAdd(sys.n, content, author)}
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
  displayImp, onImpCycle, tasks,
  projectComments, commentsOpen, onCommentsToggle, onCommentAdd,
}: {
  sys: Project; track: Track;
  displayName: string; onRename: (v: string) => void;
  status: StatusColor | undefined; isSelected: boolean;
  onCardClick: () => void; onDragStart: (e: React.DragEvent) => void;
  displayImp: string; onImpCycle: () => void;
  tasks: Initiative[];
  projectComments: Comment[]; commentsOpen: boolean;
  onCommentsToggle: () => void; onCommentAdd: (content: string, author: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = status ? STATUS[status] : null;
  const imp = IMP[displayImp];

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
        <span
          onClick={e => { e.stopPropagation(); onImpCycle(); }}
          title="Click to change impact"
          style={{
            fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 600, cursor: "pointer", flexShrink: 0,
            ...(imp
              ? { background: imp.bg, color: imp.text, border: `1px solid ${imp.border}` }
              : { background: "#f9f9f9", color: "#ccc", border: "1px dashed #ddd" }
            ),
          }}
        >{displayImp || "+ impact"}</span>
        <span style={{ fontSize: 10, color: "#aaa" }}>{tasks.length} tasks</span>
        <span
          onClick={e => { e.stopPropagation(); onCommentsToggle(); }}
          title="Comments"
          style={{
            fontSize: 9, padding: "1px 6px", borderRadius: 3, cursor: "pointer", flexShrink: 0,
            background: projectComments.length > 0 ? "#ede9fe" : "#f5f5f5",
            color: projectComments.length > 0 ? "#4f46e5" : "#bbb",
            border: `1px solid ${projectComments.length > 0 ? "#c4b5fd" : "#e5e5e5"}`,
          }}
        >💬 {projectComments.length > 0 ? projectComments.length : ""}</span>
        <span style={{ fontSize: 10, color: "#bbb", marginLeft: "auto" }}>{sys.cap}</span>
        {tasks.length > 0 && (
          <span
            onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
            style={{ fontSize: 9, color: "#bbb", cursor: "pointer" }}
          >{expanded ? "▲" : "▼"}</span>
        )}
      </div>
      {expanded && (
        <div style={{ marginTop: 8, borderTop: "1px solid #eee", paddingTop: 6 }}>
          {tasks.map((task, i) => (
            <div key={i} style={{ fontSize: 11, color: "#555", padding: "3px 0", display: "flex", gap: 6 }}>
              <span style={{ color: "#ccc" }}>•</span>
              <span style={{ flex: 1 }}>{task.n}</span>
              {task.s > 0 && <span style={{ color: "#bbb", flexShrink: 0 }}>{task.s}</span>}
            </div>
          ))}
        </div>
      )}
      {commentsOpen && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 8, cursor: "default" }}>
          <CommentSection comments={projectComments} onAdd={onCommentAdd} />
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  col, items, names, colors, impacts, selected,
  onCardClick, onRename, onDragStart, onDragEnter, onDrop, isOver, onImpactCycle,
  taskOverrides, comments, commentsOpen, onCommentsToggle, onCommentAdd,
}: {
  col: string;
  items: { sys: Project; track: Track }[];
  names: Record<string, string>;
  colors: Record<string, StatusColor>; impacts: Record<string, string>; selected: Set<string>;
  onCardClick: (n: string) => void; onRename: (n: string, v: string) => void;
  onDragStart: (e: React.DragEvent, n: string) => void;
  onDragEnter: (col: string) => void;
  onDrop: (e: React.DragEvent, col: string) => void;
  isOver: boolean;
  onImpactCycle: (n: string, cur: string) => void;
  taskOverrides: Record<string, Initiative[]>;
  comments: Comment[]; commentsOpen: Record<string, boolean>;
  onCommentsToggle: (n: string) => void; onCommentAdd: (pn: string, content: string, author: string) => void;
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
            displayImp={impacts[sys.n] ?? sys.imp}
            onImpCycle={() => onImpactCycle(sys.n, impacts[sys.n] ?? sys.imp)}
            tasks={taskOverrides[sys.n] ?? sys.i}
            projectComments={comments.filter(c => c.project_name === sys.n)}
            commentsOpen={commentsOpen[sys.n] ?? false}
            onCommentsToggle={() => onCommentsToggle(sys.n)}
            onCommentAdd={(content, author) => onCommentAdd(sys.n, content, author)}
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

  const [names,        setNames]        = useState<Record<string, string>>({});
  const [quarters,     setQuarters]     = useState<Record<string, string>>({});
  const [colors,       setColors]       = useState<Record<string, StatusColor>>({});
  const [impacts,      setImpacts]      = useState<Record<string, string>>({});
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [taskOverrides, setTaskOverrides] = useState<Record<string, Initiative[]>>({});
  const [comments,     setComments]     = useState<Comment[]>([]);
  const [commentsOpen, setCommentsOpen] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [brush, setBrush] = useState<StatusColor | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<string>("All");
  const [dbLoaded, setDbLoaded] = useState(false);

  // Load all shared state from DB on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/overrides').then(r => r.json()) as Promise<{ names: Record<string,string>; quarters: Record<string,string>; colors: Record<string,StatusColor>; impacts: Record<string,string> }>,
      fetch('/api/descriptions').then(r => r.json()) as Promise<{ descriptions: Record<string,string> }>,
      fetch('/api/task-overrides').then(r => r.json()) as Promise<{ taskOverrides: Record<string,Initiative[]> }>,
      fetch('/api/comments').then(r => r.json()) as Promise<Comment[]>,
    ]).then(([ov, desc, tasks, cmts]) => {
      if (Object.keys(ov.names).length)    setNames(ov.names);
      if (Object.keys(ov.quarters).length) setQuarters(ov.quarters);
      if (Object.keys(ov.colors).length)   setColors(ov.colors);
      if (Object.keys(ov.impacts).length)  setImpacts(ov.impacts);
      if (Object.keys(desc.descriptions).length) setDescriptions(desc.descriptions);
      if (Object.keys(tasks.taskOverrides).length) setTaskOverrides(tasks.taskOverrides);
      setComments(cmts);
    }).catch(() => { /* silently ignore */ }).finally(() => setDbLoaded(true));
  }, []);

  // Debounced saves
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dbLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch('/api/overrides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names, quarters, colors, impacts }) });
    }, 600);
  }, [names, quarters, colors, impacts, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    if (descTimer.current) clearTimeout(descTimer.current);
    descTimer.current = setTimeout(() => {
      void fetch('/api/descriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descriptions }) });
    }, 600);
  }, [descriptions, dbLoaded]);

  useEffect(() => {
    if (!dbLoaded) return;
    if (tasksTimer.current) clearTimeout(tasksTimer.current);
    tasksTimer.current = setTimeout(() => {
      void fetch('/api/task-overrides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskOverrides }) });
    }, 600);
  }, [taskOverrides, dbLoaded]);

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

  function handleImpactCycle(originalName: string, current: string) {
    const next = IMP_ORDER[(IMP_ORDER.indexOf(current) + 1) % IMP_ORDER.length] ?? "";
    setImpacts(prev => ({ ...prev, [originalName]: next }));
  }

  function handleDescSave(projectName: string, value: string) {
    setDescriptions(prev => ({ ...prev, [projectName]: value }));
  }

  function handleTaskAdd(projectName: string, taskName: string) {
    setTaskOverrides(prev => {
      const base = prev[projectName] ?? arch.flatMap(tr => tr.s).find(s => s.n === projectName)?.i ?? [];
      return { ...prev, [projectName]: [...base, { n: taskName, s: 16 }] };
    });
  }

  function handleTaskRemove(projectName: string, taskName: string) {
    setTaskOverrides(prev => {
      const base = prev[projectName] ?? arch.flatMap(tr => tr.s).find(s => s.n === projectName)?.i ?? [];
      return { ...prev, [projectName]: base.filter(t => t.n !== taskName) };
    });
  }

  function handleCommentsToggle(projectName: string) {
    setCommentsOpen(prev => ({ ...prev, [projectName]: !(prev[projectName] ?? false) }));
  }

  async function handleCommentAdd(projectName: string, content: string, author: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName, content, author }),
    });
    const newComment = await res.json() as Comment;
    setComments(prev => [newComment, ...prev]);
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
            <> · <span style={{ color: STATUS.blue.hex, fontWeight: 600 }}>{blueCount} recommended project{blueCount !== 1 ? "s" : ""}</span></>
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
                names={names} quarters={quarters} colors={colors} impacts={impacts} selected={selected}
                onCardClick={handleCardClick} onRename={handleRename} onImpactCycle={handleImpactCycle}
                impactFilter={impactFilter}
                descriptions={descriptions} taskOverrides={taskOverrides}
                comments={comments} commentsOpen={commentsOpen}
                onCommentsToggle={handleCommentsToggle}
                onCommentAdd={(pn, content, author) => { void handleCommentAdd(pn, content, author); }}
                onDescSave={handleDescSave} onTaskAdd={handleTaskAdd} onTaskRemove={handleTaskRemove}
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
              names={names} colors={colors} impacts={impacts} selected={selected}
              onCardClick={handleCardClick} onRename={handleRename} onImpactCycle={handleImpactCycle}
              onDragStart={handleDragStart} onDragEnter={setDragOverCol} onDrop={handleDrop}
              isOver={dragOverCol === col}
              taskOverrides={taskOverrides}
              comments={comments} commentsOpen={commentsOpen}
              onCommentsToggle={handleCommentsToggle}
              onCommentAdd={(pn, content, author) => { void handleCommentAdd(pn, content, author); }}
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
