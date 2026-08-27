import { useState } from "react";
import { List, GitBranch, Lock, Download } from "lucide-react";
import { KB_DOCS } from "../../lib/data";
import { SAMPLE_FILE, KIND_ICON, CLASS_STYLE } from "../../lib/kbStyle";
import type { KbDoc } from "../../lib/types";

const FOLDERS = Array.from(new Set(KB_DOCS.map((d) => d.folder)));

const GRAPH_POS: Record<string, { x: number; y: number }> = {
  "sop-09": { x: 90, y: 60 },
  "insp-tk204": { x: 230, y: 40 },
  "sop-14": { x: 90, y: 210 },
  "pid-cdu2": { x: 250, y: 210 },
  "hse-q2": { x: 360, y: 110 },
  "vendor-turbine": { x: 370, y: 260 },
};

const GRAPH_EDGES: [string, string][] = [
  ["sop-09", "insp-tk204"],
  ["insp-tk204", "hse-q2"],
  ["sop-14", "pid-cdu2"],
  ["pid-cdu2", "vendor-turbine"],
];

const FOLDER_COLOR: Record<string, string> = {
  "SOPs & Manuals": "var(--brand-600)",
  "Inspection Reports": "var(--copper-600)",
  "Engineering Drawings": "var(--accent)",
  "HSE Records": "var(--safe-600)",
  Correspondence: "var(--text-tertiary)",
};

export function KnowledgeBase() {
  const [selected, setSelected] = useState<KbDoc>(KB_DOCS[0]);
  const [view, setView] = useState<"list" | "graph">("list");

  return (
    <div className="flex h-full min-w-0 flex-1">
      <div className="flex w-80 shrink-0 flex-col border-r" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)" }}>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>Knowledge base</p>
            <p className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{KB_DOCS.length} documents · permission aware</p>
          </div>
          <div className="flex rounded-md border p-0.5" style={{ borderColor: "var(--border-default)" }}>
            <button
              onClick={() => setView("list")}
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: view === "list" ? "var(--bg-selected)" : "transparent", color: view === "list" ? "var(--accent-strong)" : "var(--text-tertiary)" }}
            >
              <List size={13} />
            </button>
            <button
              onClick={() => setView("graph")}
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: view === "graph" ? "var(--bg-selected)" : "transparent", color: view === "graph" ? "var(--accent-strong)" : "var(--text-tertiary)" }}
            >
              <GitBranch size={13} />
            </button>
          </div>
        </div>

        {view === "list" ? (
          <div className="flex-1 overflow-y-auto p-2">
            {FOLDERS.map((folder) => (
              <div key={folder} className="mb-1">
                <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                  {folder}
                </p>
                {KB_DOCS.filter((d) => d.folder === folder).map((doc) => {
                  const Icon = KIND_ICON[doc.kind];
                  const active = selected.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelected(doc)}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
                      style={{ background: active ? "var(--bg-selected)" : "transparent" }}
                    >
                      <Icon size={14} className="mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      <span className="min-w-0 text-[12.5px] leading-snug" style={{ color: active ? "var(--accent-strong)" : "var(--text-primary)" }}>
                        {doc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden p-2">
            <svg viewBox="0 0 440 300" className="h-full w-full">
              {GRAPH_EDGES.map(([a, b]) => (
                <line
                  key={a + b}
                  x1={GRAPH_POS[a].x}
                  y1={GRAPH_POS[a].y}
                  x2={GRAPH_POS[b].x}
                  y2={GRAPH_POS[b].y}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                />
              ))}
              {KB_DOCS.map((doc) => {
                const pos = GRAPH_POS[doc.id];
                const active = selected.id === doc.id;
                return (
                  <g key={doc.id} onClick={() => setSelected(doc)} className="cursor-pointer">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={active ? 8 : 6}
                      fill={FOLDER_COLOR[doc.folder]}
                      stroke={active ? "var(--text-primary)" : "transparent"}
                      strokeWidth={1.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 20}
                      textAnchor="middle"
                      fontSize={9.5}
                      fill="var(--text-secondary)"
                    >
                      {doc.name.split(" ").slice(0, 2).join(" ")}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
              style={{ background: CLASS_STYLE[selected.classification].bg, color: CLASS_STYLE[selected.classification].fg }}
            >
              {selected.classification}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{selected.folder}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{selected.name}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{selected.description}</p>
          {SAMPLE_FILE[selected.id] && (
            <a
              href={SAMPLE_FILE[selected.id]}
              download
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              <Download size={12} />
              Download sample source
            </a>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-5" style={{ borderColor: "var(--border-subtle)" }}>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Updated</dt>
              <dd className="mt-0.5 text-[13px]" style={{ color: "var(--text-primary)" }}>{selected.updated}</dd>
            </div>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Size</dt>
              <dd className="mt-0.5 text-[13px]" style={{ color: "var(--text-primary)" }}>{selected.size}</dd>
            </div>
            {selected.pages && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Pages</dt>
                <dd className="mt-0.5 text-[13px]" style={{ color: "var(--text-primary)" }}>{selected.pages}</dd>
              </div>
            )}
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Access</dt>
              <dd className="mt-0.5 flex items-center gap-1 text-[13px]" style={{ color: "var(--text-primary)" }}>
                <Lock size={11} /> Role and department scoped
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-sunken)" }}>
            <p className="text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Indexing</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Chunked, embedded with BGE-M3 and stored in the local vector database. Retrieval for this
              document is scoped to your role and department, and every query against it is written to
              the audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
