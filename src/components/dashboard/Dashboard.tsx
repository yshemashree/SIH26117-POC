import { Cpu, Route, Server, Gauge, ArrowRight, Radio } from "lucide-react";
import { MODELS } from "../../lib/data";
import type { AuditEntry, Turn } from "../../lib/types";

const VRAM_BUDGET_GB = 80;

function vramGb(v: string) {
  return parseFloat(v);
}

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

function FlowStep({ label, sub }: { label: string; sub: string }) {
  return (
    <div
      className="min-w-0 flex-1 rounded-lg border px-3.5 py-3"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-sunken)" }}
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
        {sub}
      </p>
    </div>
  );
}

export function Dashboard({ turns, auditLog }: { turns: Turn[]; auditLog: AuditEntry[] }) {
  const activeTurn = turns[turns.length - 1];
  const healthy = MODELS.filter((m) => m.status === "healthy").length;
  const avgLatency = Math.round(MODELS.reduce((s, m) => s + m.latencyMs, 0) / MODELS.length);
  const routingFeed = auditLog.filter((e) => e.category === "routing").slice(-10).reverse();
  const routedModel = activeTurn ? MODELS.find((m) => m.id === activeTurn.scenario.routedModelId) : undefined;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Model routing
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Every request is classified and routed automatically across the local model fleet.
            No request ever leaves this host.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Cpu} value={`${healthy}/${MODELS.length}`} label="Local models online" />
          <StatTile icon={Route} value={String(turns.length)} label="Tasks routed this session" />
          <StatTile icon={Gauge} value={`${avgLatency}ms`} label="Avg first token latency" />
          <StatTile icon={Server} value="1" label="Active GPU session" />
        </div>

        <div
          className="mt-6 rounded-lg border p-4"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <p className="mb-3 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            <Radio size={12} />
            Live routing path
          </p>
          <div className="flex items-center gap-2">
            <FlowStep label="Request" sub={activeTurn ? activeTurn.scenario.label : "Waiting for a task"} />
            <ArrowRight size={14} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
            <FlowStep label="Classifier" sub={activeTurn ? activeTurn.scenario.categoryLabel : "Idle"} />
            <ArrowRight size={14} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
            <FlowStep label="Routed model" sub={routedModel ? routedModel.name : "None yet"} />
          </div>
        </div>

        <p className="mb-3 mt-8 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Model fleet
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {MODELS.map((m) => {
            const active = m.id === activeTurn?.scenario.routedModelId;
            const gb = vramGb(m.vram);
            const pct = Math.min(100, Math.round((gb / VRAM_BUDGET_GB) * 100));
            return (
              <div
                key={m.id}
                className="rounded-lg border p-4"
                style={{
                  borderColor: active ? "var(--accent-strong)" : "var(--border-subtle)",
                  background: active ? "var(--bg-selected)" : "var(--bg-surface)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                    <p className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{m.family} · {m.params}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[10.5px] font-medium" style={{ color: "var(--safe-600)" }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--safe-500)" }} />
                    healthy
                  </span>
                </div>

                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{m.notes}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {m.capabilities.map((c) => (
                    <span
                      key={c}
                      className="rounded-full px-1.5 py-0.5 text-[9.5px] font-medium"
                      style={{ background: "var(--bg-sunken)", color: "var(--text-secondary)" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    <span>VRAM reserved</span>
                    <span className="mono">{m.vram}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-sunken)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--accent)" }}
                    />
                  </div>
                </div>

                <div className="mono mt-3 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  <span>{m.quantization}</span>
                  <span>{m.contextWindow}</span>
                  <span>{m.latencyMs}ms p50</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mb-3 mt-8 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Recent routing decisions
        </p>
        <div className="rounded-lg border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
          {routingFeed.length === 0 ? (
            <p className="p-4 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>
              No tasks routed yet. Run a sample prompt from Agent Chat to see decisions here.
            </p>
          ) : (
            <ul>
              {routingFeed.map((e, i) => (
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
