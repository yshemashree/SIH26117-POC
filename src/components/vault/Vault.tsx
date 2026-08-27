import { Download, Lock } from "lucide-react";
import { KB_DOCS } from "../../lib/data";
import { SAMPLE_FILE, KIND_ICON, CLASS_STYLE } from "../../lib/kbStyle";
import type { Turn } from "../../lib/types";
import { DeliverableCard } from "../chat/DeliverableCard";

export function Vault({ turns }: { turns: Turn[] }) {
  const deliverables = [...turns].reverse().filter((t) => t.scenario.deliverable && t.approval !== "rejected");

  const usedDocIds = Array.from(new Set(turns.flatMap((t) => t.scenario.attachedFiles)));
  const usedDocs = usedDocIds.map((id) => KB_DOCS.find((d) => d.id === id)).filter((d): d is (typeof KB_DOCS)[number] => !!d);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Vault
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Every deliverable the agent has produced, and every source document it read, in one place.
          </p>
        </div>

        <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Deliverables · {deliverables.length}
        </p>
        {deliverables.length === 0 ? (
          <p
            className="rounded-lg border p-4 text-[12.5px]"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)", color: "var(--text-tertiary)" }}
          >
            Nothing produced yet. Run a sample prompt from Agent Chat, approve it, and it will show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {deliverables.map((t) => (
              <div key={t.id}>
                <p className="mb-1.5 truncate text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
                  {t.time} · from &ldquo;{t.scenario.label}&rdquo;
                </p>
                <DeliverableCard
                  deliverable={t.scenario.deliverable!}
                  locked={t.approval === "pending"}
                  citations={t.scenario.steps.flatMap((s) => s.citations ?? [])}
                />
              </div>
            ))}
          </div>
        )}

        <p className="mb-3 mt-8 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Source documents used · {usedDocs.length}
        </p>
        {usedDocs.length === 0 ? (
          <p
            className="rounded-lg border p-4 text-[12.5px]"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)", color: "var(--text-tertiary)" }}
          >
            No knowledge base documents have been read yet this session.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
            {usedDocs.map((doc, i) => {
              const Icon = KIND_ICON[doc.kind];
              const cls = CLASS_STYLE[doc.classification];
              const sample = SAMPLE_FILE[doc.id];
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    style={{ background: "var(--bg-sunken)", color: "var(--text-tertiary)" }}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                    <p className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {doc.folder}
                      <span
                        className="ml-1 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold"
                        style={{ background: cls.bg, color: cls.fg }}
                      >
                        <Lock size={8} />
                        {doc.classification}
                      </span>
                    </p>
                  </div>
                  {sample && (
                    <a
                      href={sample}
                      download
                      className="flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors"
                      style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      <Download size={12} />
                      Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
