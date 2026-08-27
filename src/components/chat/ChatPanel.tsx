import { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  ListChecks,
  Wrench,
  Brain,
  UserCheck,
  Quote,
  CheckCircle2,
  XCircle,
  X,
  Library,
} from "lucide-react";
import type { AgentStep, Turn } from "../../lib/types";
import { SCENARIOS, MODELS, KB_DOCS } from "../../lib/data";
import { CodeBlock } from "../common/CodeBlock";
import { DeliverableCard } from "./DeliverableCard";
import { useAuth } from "../../lib/auth";

interface PendingFile {
  name: string;
  folder?: string;
}

const STEP_META: Record<AgentStep["kind"], { icon: typeof ListChecks; label: string }> = {
  plan: { icon: ListChecks, label: "Plan" },
  "tool-call": { icon: Wrench, label: "Tool call" },
  "tool-result": { icon: Wrench, label: "Tool result" },
  model: { icon: Brain, label: "Model" },
  approval: { icon: UserCheck, label: "Human review" },
  deliverable: { icon: UserCheck, label: "Deliverable" },
};

function StepCard({ step, onApprove, onReject, approval }: {
  step: AgentStep;
  approval?: "none" | "pending" | "approved" | "rejected";
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const meta = STEP_META[step.kind];
  const Icon = meta.icon;
  const model = step.modelId ? MODELS.find((m) => m.id === step.modelId) : undefined;
  const isApproval = step.kind === "approval";

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex flex-col items-center">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: isApproval ? "var(--copper-500)" : "var(--border-default)",
            background: isApproval ? "var(--copper-100)" : "var(--bg-surface)",
            color: isApproval ? "var(--copper-700)" : "var(--text-secondary)",
          }}
        >
          <Icon size={12} />
        </span>
        <span className="mt-1 w-px flex-1" style={{ background: "var(--border-subtle)" }} />
      </div>

      <div className="min-w-0 flex-1 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
            {step.title}
          </p>
          {model && (
            <span
              className="rounded-full border px-2 py-0.5 text-[10.5px] font-medium"
              style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
            >
              {model.name}
            </span>
          )}
          {step.durationMs && (
            <span className="mono text-[10.5px]" style={{ color: "var(--text-tertiary)" }}>
              {(step.durationMs / 1000).toFixed(2)}s
            </span>
          )}
        </div>

        {step.detail && (
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {step.detail}
          </p>
        )}

        {step.code && (
          <div className="mt-2">
            <CodeBlock code={step.code} lang={step.codeLang ?? "python"} compact />
          </div>
        )}

        {step.output && (
          <pre
            className="mono mt-2 whitespace-pre-wrap rounded-md border px-3 py-2 text-[12px] leading-relaxed"
            style={{ background: "var(--bg-sunken)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          >
            {step.output}
          </pre>
        )}

        {step.citations && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {step.citations.map((c) => (
              <span
                key={c.doc + c.page}
                className="flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <Quote size={10} />
                {c.doc} · p.{c.page}
              </span>
            ))}
          </div>
        )}

        {isApproval && approval === "pending" && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors"
              style={{ background: "var(--safe-600)" }}
            >
              <CheckCircle2 size={13} />
              Approve and export
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
              style={{ borderColor: "var(--border-default)", color: "var(--alert-600)" }}
            >
              <XCircle size={13} />
              Reject, send back
            </button>
          </div>
        )}
        {isApproval && approval === "approved" && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: "var(--safe-600)" }}>
            <CheckCircle2 size={13} /> Approved by you, deliverable exported and logged
          </p>
        )}
        {isApproval && approval === "rejected" && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: "var(--alert-600)" }}>
            <XCircle size={13} /> Rejected. Returned to the agent queue for revision
          </p>
        )}
      </div>
    </div>
  );
}

function TurnBlock({ turn, onApprove, onReject }: { turn: Turn; onApprove: () => void; onReject: () => void }) {
  const { user } = useAuth();
  const { scenario, revealCount, approval } = turn;
  const visibleSteps = scenario.steps.slice(0, revealCount);
  const allRevealed = revealCount >= scenario.steps.length;
  const showDeliverable = scenario.deliverable && allRevealed && approval !== "rejected";
  const locked = approval === "pending";

  return (
    <div className="flex flex-col gap-4 border-b py-6 first:pt-0" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ background: "var(--brand-700)" }}
        >
          {user?.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>{user?.name}</span>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{turn.time}</span>
          </div>
          <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {scenario.prompt}
          </p>
          {scenario.attachedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {scenario.attachedFiles.map((fid) => {
                const doc = KB_DOCS.find((d) => d.id === fid);
                if (!doc) return null;
                return (
                  <span
                    key={fid}
                    className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
                    style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    <Paperclip size={10} />
                    {doc.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 pl-10">
        <div className="min-w-0 flex-1">
          <span
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
          >
            {scenario.categoryLabel}
          </span>

          <div className="flex flex-col">
            {visibleSteps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                approval={step.kind === "approval" ? approval : undefined}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
            {!allRevealed && (
              <div className="flex items-center gap-2 py-1 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>
                <span className="mono">Agent working</span>
                <span className="caret">▍</span>
              </div>
            )}
          </div>

          {showDeliverable && scenario.deliverable && (
            <div className="mt-1">
              <DeliverableCard deliverable={scenario.deliverable} locked={locked} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SAMPLE_PROMPTS = SCENARIOS.map((s) => ({ id: s.id, label: s.label, prompt: s.prompt }));

export function ChatPanel({
  turns,
  onSend,
  onApprove,
  onReject,
}: {
  turns: Turn[];
  onSend: (prompt: string, files: PendingFile[]) => void;
  onApprove: (turnId: string) => void;
  onReject: (turnId: string) => void;
}) {
  const [value, setValue] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [kbOpen, setKbOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const revealSignature = turns.map((t) => t.revealCount).join(",");
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, revealSignature]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, pendingFiles);
    setValue("");
    setPendingFiles([]);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6">
        <div className="mx-auto max-w-3xl">
          {turns.length === 0 ? (
            <EmptyState onPick={(p) => submit(p)} />
          ) : (
            turns.map((t) => (
              <TurnBlock key={t.id} turn={t} onApprove={() => onApprove(t.id)} onReject={() => onReject(t.id)} />
            ))
          )}
        </div>
      </div>

      <div className="border-t px-6 py-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mx-auto max-w-3xl">
          {turns.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => submit(p.prompt)}
                  className="rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {pendingFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {pendingFiles.map((f, i) => (
                <span
                  key={f.name + i}
                  className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <Paperclip size={10} />
                  {f.name}
                  <button onClick={() => setPendingFiles((p) => p.filter((_, idx) => idx !== i))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div
            className="flex items-end gap-2 rounded-xl border px-3 py-2.5"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
          >
            <div className="relative">
              <button
                onClick={() => setKbOpen((v) => !v)}
                title="Attach from knowledge base"
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--text-tertiary)" }}
              >
                <Library size={16} />
              </button>
              {kbOpen && (
                <div
                  className="absolute bottom-10 left-0 z-20 w-72 rounded-lg border py-1.5 shadow-lg"
                  style={{ background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)" }}
                >
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                    Attach a sample document
                  </p>
                  {KB_DOCS.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setPendingFiles((p) => [...p, { name: doc.name, folder: doc.folder }]);
                        setKbOpen(false);
                      }}
                      className="flex w-full flex-col px-3 py-1.5 text-left text-[12.5px] transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {doc.name}
                      <span className="text-[10.5px]" style={{ color: "var(--text-tertiary)" }}>{doc.folder}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload a file"
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setPendingFiles((p) => [...p, ...files.map((f) => ({ name: f.name }))]);
                e.target.value = "";
              }}
            />

            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(value);
                }
              }}
              placeholder="Ask Rakshaka to draft, analyze, retrieve or write and run code"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent py-1 text-[13.5px] outline-none"
              style={{ color: "var(--text-primary)" }}
            />

            <button
              onClick={() => submit(value)}
              disabled={!value.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white transition-colors disabled:opacity-40"
              style={{ background: "var(--accent-strong)" }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Every request stays inside the plant network. Nothing here is sent to an external model.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Where should we start
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Four grounded walkthroughs are loaded for this preview, spanning document drafting, coding,
          knowledge retrieval and board reporting. Pick one, or type your own request below.
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p.prompt)}
            className="rounded-lg border p-3.5 text-left transition-colors"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
          >
            <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{p.label}</p>
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{p.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
