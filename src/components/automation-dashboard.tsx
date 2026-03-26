"use client";

import { useState } from "react";
import { arch, type Track, type Project, type Initiative } from "@/lib/automation-data";

const HL = "#4f46e5";
const HLbg = "rgba(79,70,229,0.07)";
const HLborder = "rgba(79,70,229,0.3)";

const impColors: Record<string, { bg: string; text: string; border: string }> = {
  High:       { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  "Med-High": { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  Medium:     { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  Low:        { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" },
};

function bucketQ(q: string): string {
  if (!q) return "Backlog";
  const ql = q.toLowerCase();
  if (ql.includes("progress")) return "In Progress";
  if (["ice box", "icebox", "tbd", "later"].includes(ql)) return "Backlog";
  if (ql.includes("q1") && !ql.includes("q2")) return "Q1 2026";
  if (ql.includes("q2")) return "Q2 2026";
  if (ql.includes("q3")) return "Q3+ 2026";
  return "Backlog";
}

const KANBAN_COLS = ["In Progress", "Q1 2026", "Q2 2026", "Q3+ 2026", "Backlog"];

function countAll() {
  let ts = 0, ii = 0, rc = 0;
  for (const track of arch) {
    ts += track.s.length;
    for (const sys of track.s) {
      ii += sys.i.length;
      if (sys.r) rc++;
    }
  }
  return { ts, ii, rc };
}

// ── Initiative row ────────────────────────────────────────────────────────────

function InitiativeRow({ init, trackColor }: { init: Initiative; trackColor: string }) {
  return (
    <div
      style={{
        padding: "7px 12px",
        borderLeft: init.f ? `3px solid ${trackColor}` : "3px solid #e0e0e0",
        marginBottom: 3,
        background: init.f ? `${trackColor}1A` : "transparent",
        borderRadius: "0 6px 6px 0",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap" as const,
      }}
    >
      <span style={{ fontSize: 12, color: "#444", flex: 1, minWidth: 0 }}>{init.n}</span>
      {init.j && <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0 }}>{init.j}</span>}
      {init.s > 0 && <span style={{ fontSize: 11, color: "#999", flexShrink: 0 }}>{init.s}</span>}
      {init.f && (
        <span
          style={{
            fontSize: 9,
            padding: "2px 6px",
            borderRadius: 4,
            background: trackColor,
            color: "#fff",
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: "nowrap" as const,
          }}
        >
          {init.f}
        </span>
      )}
    </div>
  );
}

// ── Project row ───────────────────────────────────────────────────────────────

function ProjectRow({
  sys,
  track,
  openSys,
  setOS,
}: {
  sys: Project;
  track: Track;
  openSys: string | null;
  setOS: (v: string | null) => void;
}) {
  const sOpen = openSys === sys.n;
  const ic2 = impColors[sys.imp];

  return (
    <div style={{ marginTop: 8 }}>
      <div
        onClick={() => setOS(sOpen ? null : sys.n)}
        style={{
          padding: "10px 12px",
          background: sys.r ? HLbg : "#f9f9f9",
          borderRadius: 8,
          cursor: "pointer",
          userSelect: "none" as const,
          border: sys.r ? `1.5px solid ${HLborder}` : "1px solid transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 11, color: "#aaa" }}>{sOpen ? "▼" : "▶"}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: sys.r ? HL : "#222" }}>{sys.n}</span>
          {sys.i.length > 0 && <span style={{ fontSize: 11, color: "#999" }}>({sys.i.length})</span>}
          {sys.imp && ic2 && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 4,
                background: ic2.bg,
                color: ic2.text,
                border: `1px solid ${ic2.border}`,
                fontWeight: 600,
              }}
            >
              {sys.imp}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#999", flexShrink: 0 }}>{sys.q}</span>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, marginLeft: 19 }}>
          Captain: {sys.cap}
        </div>
      </div>

      {sOpen && (
        <div style={{ marginLeft: 19, marginTop: 6 }}>
          <div
            style={{
              padding: "10px 12px",
              marginBottom: 8,
              background: "#fafafa",
              borderRadius: 8,
              borderLeft: `3px solid ${track.c}`,
              fontSize: 12,
              lineHeight: 1.6,
              color: "#555",
            }}
          >
            {sys.p}
          </div>
          {sys.i.length > 0 ? (
            sys.i.map((init, idx) => (
              <InitiativeRow key={idx} init={init} trackColor={track.c} />
            ))
          ) : (
            <div style={{ padding: "8px 12px", fontSize: 12, color: "#bbb", fontStyle: "italic" }}>
              Project-level work only — no tasks mapped yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Track row ─────────────────────────────────────────────────────────────────

function TrackRow({
  tr,
  openTrack,
  setOT,
  openSys,
  setOS,
}: {
  tr: Track;
  openTrack: string | null;
  setOT: (v: string | null) => void;
  openSys: string | null;
  setOS: (v: string | null) => void;
}) {
  const isOpen = openTrack === tr.t;
  const ic = tr.s.reduce((acc, s) => acc + s.i.length, 0);

  return (
    <div style={{ border: "1px solid #e2e2e2", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <div
        onClick={() => { setOT(isOpen ? null : tr.t); setOS(null); }}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderLeft: `4px solid ${tr.c}`,
          userSelect: "none" as const,
        }}
      >
        <span style={{ fontSize: 12, color: "#999" }}>{isOpen ? "▼" : "▶"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: tr.c }}>{tr.t}</span>
            <span style={{ fontSize: 11, color: "#888", background: "#f5f5f5", padding: "2px 8px", borderRadius: 4 }}>
              {tr.s.length} projects · {ic} tasks
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{tr.d}</div>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: "0 16px 12px 20px", borderLeft: `4px solid ${tr.c}` }}>
          {tr.s.map((sys) => (
            <ProjectRow key={sys.n} sys={sys} track={tr} openSys={openSys} setOS={setOS} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Kanban ────────────────────────────────────────────────────────────────────

function KanbanView({ kanbanOpen, setKP }: { kanbanOpen: string | null; setKP: (v: string | null) => void }) {
  const allProjects = arch.flatMap((track) => track.s.map((proj) => ({ proj, track })));
  const kanbanData: Record<string, typeof allProjects> = Object.fromEntries(KANBAN_COLS.map((c) => [c, []]));
  for (const item of allProjects) {
    const bucket = bucketQ(item.proj.q);
    kanbanData[bucket]?.push(item);
  }

  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12 }}>
      {KANBAN_COLS.map((col) => {
        const items = kanbanData[col] ?? [];
        return (
          <div key={col} style={{ minWidth: 200, maxWidth: 220, flex: "0 0 auto" }}>
            <div style={{ padding: "8px 10px", marginBottom: 8, borderRadius: 8, background: "#f5f5f5" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{col}</span>
              <span style={{ fontSize: 11, color: "#999", marginLeft: 6 }}>({items.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map(({ proj: pr, track: tr }, idx) => {
                const ic2 = impColors[pr.imp];
                const key = `${col}-${idx}`;
                const isOpen = kanbanOpen === key;
                return (
                  <div
                    key={idx}
                    onClick={() => setKP(isOpen ? null : key)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: pr.r ? HLbg : "#fff",
                      border: pr.r ? `1.5px solid ${HLborder}` : "1px solid #e2e2e2",
                      cursor: "pointer",
                      userSelect: "none" as const,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: tr.c, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#888" }}>{tr.t}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: pr.r ? HL : "#222", lineHeight: 1.4 }}>
                      {pr.n}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" as const }}>
                      {pr.imp && ic2 && (
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: ic2.bg, color: ic2.text, border: `1px solid ${ic2.border}`, fontWeight: 600 }}>
                          {pr.imp}
                        </span>
                      )}
                      <span style={{ fontSize: 10, color: "#aaa" }}>{pr.i.length} tasks</span>
                      <span style={{ fontSize: 10, color: "#bbb", marginLeft: "auto" }}>{pr.cap}</span>
                    </div>
                    {isOpen && pr.i.length > 0 && (
                      <div style={{ marginTop: 8, borderTop: "1px solid #e8e8e8", paddingTop: 6 }}>
                        {pr.i.map((task, ti) => (
                          <div key={ti} style={{ fontSize: 11, color: "#555", padding: "3px 0", display: "flex", gap: 6 }}>
                            <span style={{ color: "#ccc" }}>•</span>
                            <span style={{ flex: 1 }}>{task.n}</span>
                            {task.s > 0 && <span style={{ color: "#bbb", flexShrink: 0 }}>{task.s}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <div style={{ padding: 12, fontSize: 12, color: "#ccc", fontStyle: "italic", textAlign: "center" as const }}>
                  No projects
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AutomationDashboard() {
  const [openTrack, setOT] = useState<string | null>(null);
  const [openSys, setOS] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [kanbanOpen, setKP] = useState<string | null>(null);
  const ct = countAll();

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 960, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111" }}>
          Ace Automation Initiatives
        </h2>
        <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
          {arch.length} tracks · {ct.ts} projects · {ct.ii} tasks ·{" "}
          <span style={{ color: HL, fontWeight: 600 }}>{ct.rc} potential OKRs</span>
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", gap: 4 }}>
            {(["list", "kanban"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: view === v ? "2px solid #333" : "1px solid #ddd",
                  background: view === v ? "#222" : "transparent",
                  color: view === v ? "#fff" : "#555",
                  fontSize: 12,
                  fontWeight: view === v ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {v === "list" ? "List View" : "Kanban"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: HLbg, border: `1.5px solid ${HLborder}` }} />
            <span style={{ fontSize: 11, color: HL, fontWeight: 600 }}>Potential OKR</span>
          </div>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {arch.map((tr) => (
            <TrackRow
              key={tr.t}
              tr={tr}
              openTrack={openTrack}
              setOT={setOT}
              openSys={openSys}
              setOS={setOS}
            />
          ))}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && <KanbanView kanbanOpen={kanbanOpen} setKP={setKP} />}
    </div>
  );
}
