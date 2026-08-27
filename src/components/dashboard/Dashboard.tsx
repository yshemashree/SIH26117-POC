import { Cpu, Route, Package, Gauge, Server } from "lucide-react";
import { MODELS } from "../../lib/data";
import type { AuditEntry, Capability, Turn } from "../../lib/types";

const EXCLUDED_IDS = ["bge-m3-embed", "bge-reranker-v2"];
const PRIMARY_MODELS = MODELS.filter((m) => !EXCLUDED_IDS.includes(m.id));

const CAPABILITY_LABEL: Record<Capability, string> = {
  reasoning: "Reasoning",
  coding: "Coding",
  vision: "Images & drawings",
  ocr: "Scanned documents",
  embedding: "Search index",
  reranking: "Search ranking",
};

function StatTile({ icon: Icon, value, label }: { icon: typeof Cpu; value: string; label: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border p-4"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="mono text-xl font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="mt-1 truncate text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export function Dashboard({ turns, auditLog }: { turns: Turn[]; auditLog: AuditEntry[] }) {
  const activeTurn = turns[turns.length - 1];
  const healthy = PRIMARY_MODELS.filter((m) => m.status === "healthy").length;
  const avgLatency = Math.round(PRIMARY_MODELS.reduce((s, m) => s + m.latencyMs, 0) / PRIMARY_MODELS.length);
  const recentActivity = auditLog.filter((e) => e.category === "routing" || e.category === "approval").slice(-6).reverse();
  const routedModel = activeTurn ? MODELS.find((m) => m.id === activeTurn.scenario.routedModelId) : undefined;
  const deliverableCount = turns.filter((t) => t.scenario.deliverable && t.approval !== "rejected").length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Model routing
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Rakshaka automatically picks the right model for each request. Nothing ever leaves this machine.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile icon={Cpu} value={`${healthy}/${PRIMARY_MODELS.length}`} label="Models online" />
          <StatTile icon={Route} value={String(turns.length)} label="Tasks this session" />
          <StatTile icon={Gauge} value={`${avgLatency}ms`} label="Avg response start" />
          <StatTile icon={Package} value={String(deliverableCount)} label="Deliverables" />
          <StatTile icon={Server} value="1" label="GPU session" />
        </div>

        <div
          className="mt-6 flex items-center gap-3 rounded-lg border p-4"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
            style={{ background: activeTurn ? "var(--safe-100)" : "var(--bg-sunken)", color: activeTurn ? "var(--safe-600)" : "var(--text-tertiary)" }}
          >
            <Route size={16} />
          </span>
          {activeTurn ? (
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
              Last request went to <strong>{routedModel?.name}</strong>, chosen for{" "}
              <span style={{ color: "var(--text-secondary)" }}>{activeTurn.scenario.categoryLabel.toLowerCase()}</span>.
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              No task running yet. Send a request from Agent Chat to see it routed here.
            </p>
          )}
        </div>

        <p className="mb-3 mt-8 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Models available
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRIMARY_MODELS.map((m) => {
            const active = m.id === activeTurn?.scenario.routedModelId;
            return (
              <div
                key={m.id}
                className="rounded-lg border p-4 transition-colors duration-300"
                style={{
                  borderColor: active ? "var(--accent-strong)" : "var(--border-subtle)",
                  background: active ? "var(--bg-selected)" : "var(--bg-surface)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                  <span className="flex shrink-0 items-center gap-1 text-[10.5px]" style={{ color: "var(--safe-600)" }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--safe-500)" }} />
                    online
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{m.notes}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.capabilities.map((c) => (
                    <span
                      key={c}
                      className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                      style={{ background: "var(--bg-sunken)", color: "var(--text-secondary)" }}
                    >
                      {CAPABILITY_LABEL[c]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mb-3 mt-8 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Recent activity
        </p>
        <div className="rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
          {recentActivity.length === 0 ? (
            <p className="p-4 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>
              Nothing yet. Run a sample prompt from Agent Chat to see activity here.
            </p>
          ) : (
            <ul>
              {recentActivity.map((e, i) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-[12.5px]"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}
                >
                  <span className="mono shrink-0 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{e.time}</span>
                  <span style={{ color: "var(--text-primary)" }}>{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
