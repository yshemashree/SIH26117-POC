import { useEffect, useState } from "react";
import { ScrollText, Network as NetworkIcon, Cpu, Route } from "lucide-react";
import type { AuditEntry, Turn } from "../../lib/types";
import { MODELS, NETWORK_ALLOWLIST } from "../../lib/data";

type Tab = "audit" | "network" | "models";

const CATEGORY_COLOR: Record<AuditEntry["category"], string> = {
  routing: "var(--brand-600)",
  tool: "var(--text-tertiary)",
  security: "var(--alert-600)",
  approval: "var(--copper-600)",
  export: "var(--safe-600)",
  system: "var(--text-tertiary)",
};

export function RightRail({ auditLog, activeTurn }: { auditLog: AuditEntry[]; activeTurn?: Turn }) {
  const [tab, setTab] = useState<Tab>("audit");

  return (
    <aside
      className="flex w-[320px] shrink-0 flex-col border-l"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <RailTab active={tab === "audit"} icon={ScrollText} label="Audit" onClick={() => setTab("audit")} />
        <RailTab active={tab === "network"} icon={NetworkIcon} label="Network" onClick={() => setTab("network")} />
        <RailTab active={tab === "models"} icon={Cpu} label="Models" onClick={() => setTab("models")} />
      </div>

      {tab === "audit" && <AuditTab entries={auditLog} />}
      {tab === "network" && <NetworkTab />}
      {tab === "models" && <ModelsTab activeTurn={activeTurn} />}
    </aside>
  );
}

function RailTab({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof ScrollText; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-[12px] font-medium transition-colors"
      style={{
        borderColor: active ? "var(--accent-strong)" : "transparent",
        color: active ? "var(--accent-strong)" : "var(--text-tertiary)",
      }}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function AuditTab({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3">
      {entries.length === 0 ? (
        <p className="px-1 text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Audit entries appear here as tasks run: routing decisions, tool calls, security checks and approvals.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {[...entries].reverse().map((e) => (
            <li key={e.id} className="animate-fade-in flex gap-2.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[e.category] }} />
              <div className="min-w-0">
                <p className="mono text-[10.5px]" style={{ color: "var(--text-tertiary)" }}>{e.time} · {e.actor}</p>
                <p className="text-[12px] leading-snug" style={{ color: "var(--text-primary)" }}>{e.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NetworkTab() {
  const [lastCheck, setLastCheck] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setLastCheck(new Date()), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div
        className="rounded-lg border p-3.5"
        style={{ borderColor: "var(--safe-100)", background: "var(--safe-100)" }}
      >
        <p className="text-[12px] font-semibold" style={{ color: "var(--safe-600)" }}>
          0 external requests this session
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Outbound firewall default-deny. Only loopback and the site LAN below are reachable from this host.
        </p>
        <p className="mono mt-2 text-[10.5px]" style={{ color: "var(--text-tertiary)" }}>
          last checked {lastCheck.toLocaleTimeString()}
        </p>
      </div>

      <p className="mb-2 mt-4 px-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
        Allowed endpoints
      </p>
      <ul className="flex flex-col gap-2">
        {NETWORK_ALLOWLIST.map((n) => (
          <li
            key={n.addr}
            className="flex items-center justify-between rounded-md border px-2.5 py-2"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="min-w-0">
              <p className="mono text-[11.5px]" style={{ color: "var(--text-primary)" }}>{n.addr}</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{n.label}</p>
            </div>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase"
              style={{ background: "var(--bg-sunken)", color: "var(--text-tertiary)" }}
            >
              {n.kind}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModelsTab({ activeTurn }: { activeTurn?: Turn }) {
  const routedId = activeTurn?.scenario.routedModelId;
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div
        className="mb-4 rounded-lg border p-3.5"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-sunken)" }}
      >
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
          <Route size={13} />
          Active routing
        </div>
        {activeTurn ? (
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {activeTurn.scenario.categoryLabel} matched capabilities on{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {MODELS.find((m) => m.id === routedId)?.name}
            </span>
            . Fallback and health checks pass for all candidate models.
          </p>
        ) : (
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            No task running. The router selects a model automatically once a request is submitted.
          </p>
        )}
      </div>

      <p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
        Model registry
      </p>
      <ul className="flex flex-col gap-2">
        {MODELS.map((m) => {
          const active = m.id === routedId;
          return (
            <li
              key={m.id}
              className="rounded-lg border p-3 transition-colors"
              style={{
                borderColor: active ? "var(--accent-strong)" : "var(--border-subtle)",
                background: active ? "var(--bg-selected)" : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                <span className="flex items-center gap-1 text-[10.5px]" style={{ color: "var(--safe-600)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--safe-500)" }} />
                  {m.status}
                </span>
              </div>
              <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{m.notes}</p>
              <div className="mt-2 flex flex-wrap gap-1">
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
              <div className="mono mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                <span>{m.params} · {m.quantization}</span>
                <span>{m.contextWindow}</span>
                <span>{m.vram} VRAM</span>
                <span>{m.latencyMs}ms p50</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
