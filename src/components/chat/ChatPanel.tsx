import { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  ListChecks,
  Wrench,
  Brain,
  CheckCircle2,
  XCircle,
  X,
  Library,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import type { AgentStep, Turn } from "../../lib/types";
import { SCENARIOS, MODELS, KB_DOCS } from "../../lib/data";
import { CodeBlock } from "../common/CodeBlock";
import { CitationRow } from "../common/CitationRow";
import { ScanPreview } from "../common/ScanPreview";
import { DeliverableCard } from "./DeliverableCard";
import { RakshakaMark } from "../common/Logo";

interface PendingFile {
  name: string;
  folder?: string;
}

const STEP_META: Record<AgentStep["kind"], { icon: typeof ListChecks }> = {
  plan: { icon: ListChecks },
  "tool-call": { icon: Wrench },
  "tool-result": { icon: Wrench },
  model: { icon: Brain },
  approval: { icon: UserCheck },
  deliverable: { icon: UserCheck },
};

function StepRow({ step }: { step: AgentStep }) {
  const Icon = STEP_META[step.kind].icon;
  const model = step.modelId ? MODELS.find((m) => m.id === step.modelId) : undefined;

  return (
    <div className="flex gap-3 py-2.5 animate-fade-in">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--bg-sunken)", color: "var(--text-tertiary)" }}
      >
        <Icon size={11} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>{step.title}</p>
          {model && (
            <span className="text-[10.5px]" style={{ color: "var(--text-tertiary)" }}>{model.name}</span>
          )}
        </div>
        {step.detail && (
          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.detail}</p>
        )}
        {step.showScan && <ScanPreview label="Scanned original" align="left" />}
        {step.code && (
          <div className="mt-2"><CodeBlock code={step.code} lang={step.codeLang ?? "python"} compact /></div>
        )}
        {step.output && (
          <pre
            className="mono mt-2 whitespace-pre-wrap rounded-md border px-3 py-2 text-[11.5px] leading-relaxed"
            style={{ background: "var(--bg-sunken)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            {step.output}
          </pre>
        )}
        {step.citations && <CitationRow citations={step.citations} />}
      </div>
    </div>
  );
}

function AgentTrail({ steps, running, meta }: { steps: AgentStep[]; running: boolean; meta: string }) {
  const [open, setOpen] = useState(running);
  const wasRunning = useRef(running);

  useEffect(() => {
    if (wasRunning.current && !running) {
      const t = setTimeout(() => setOpen(false), 900);
      wasRunning.current = running;
      return () => clearTimeout(t);
    }
    wasRunning.current = running;
  }, [running]);

  if (steps.length === 0) return null;

  return (
    <div className="mb-3 rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
      >
        <ChevronRight
          size={13}
          className="shrink-0 transition-transform"
          style={{ color: "var(--text-tertiary)", transform: open ? "rotate(90deg)" : "none" }}
        />
        <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
          {running ? "Working" : "Agent steps"}
        </span>
        <span className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{meta}</span>
        {running && <span className="caret text-[12px]" style={{ color: "var(--text-tertiary)" }}>▍</span>}
      </button>
      {open && (
        <div className="divide-y px-3 pb-2" style={{ borderColor: "var(--border-subtle)" }}>
          {steps.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalBar({ approval, detail, onApprove, onReject }: {
  approval: "pending" | "approved" | "rejected";
  detail?: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (approval === "approved") {
    return (
      <p className="mb-3 flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: "var(--safe-600)" }}>
        <CheckCircle2 size={14} /> Approved and exported
      </p>
    );
  }
  if (approval === "rejected") {
    return (
      <p className="mb-3 flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: "var(--alert-600)" }}>
        <XCircle size={14} /> Rejected, sent back to the agent
      </p>
    );
  }
  return (
    <div
      className="mb-3 rounded-lg border p-3.5"
      style={{ borderColor: "var(--copper-300)", background: "var(--copper-100)" }}
    >
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: "var(--copper-700)" }}>
        <UserCheck size={14} />
        Needs your review before it can be exported
      </p>
      {detail && (
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{detail}</p>
      )}
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
    </div>
  );
}

function TurnBlock({ turn, onApprove, onReject }: { turn: Turn; onApprove: () => void; onReject: () => void }) {
  const { scenario, revealCount, approval } = turn;
  const visibleSteps = scenario.steps.slice(0, revealCount);
  const allRevealed = revealCount >= scenario.steps.length;
  const running = !allRevealed;

  const approvalStep = visibleSteps.find((s) => s.kind === "approval");
  const trailSteps = visibleSteps.filter((s) => s.kind !== "approval");
  const lastModelStep = [...visibleSteps].reverse().find((s) => s.kind === "model");
  const allCitations = visibleSteps.flatMap((s) => s.citations ?? []);

  const modelUsed = MODELS.find((m) => m.id === scenario.routedModelId);
  const trailMeta = `${trailSteps.length} steps · ${modelUsed?.name ?? ""}`;

  const showDeliverable = scenario.deliverable && allRevealed && approval !== "rejected";
  const showAnswer = !scenario.deliverable && allRevealed && lastModelStep?.detail;
  const locked = approval === "pending";

  return (
    <div id={turn.id} className="flex scroll-mt-4 flex-col gap-5 border-b py-7 first:pt-0" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex flex-col items-end">
        <span className="mb-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{turn.time}</span>
        <div
          className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2.5"
          style={{ background: "var(--bg-sunken)" }}
        >
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {scenario.prompt}
          </p>
        </div>
        {scenario.attachedFiles.length > 0 && (
          <div className="mt-2 flex max-w-[75%] flex-wrap justify-end gap-1.5">
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

      <div className="flex min-w-0 flex-col">
        <div className="mb-2 flex items-center gap-2">
          <RakshakaMark size={16} />
          <span className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>Rakshaka</span>
        </div>

        <div className="pl-[26px]">
          <AgentTrail steps={trailSteps} running={running} meta={trailMeta} />

          {approvalStep && (
            <ApprovalBar
              approval={approval === "none" ? "pending" : approval}
              detail={approvalStep.detail}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}

          {showAnswer && (
            <div>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {lastModelStep!.detail}
              </p>
              {allCitations.length > 0 && <CitationRow citations={allCitations} />}
            </div>
          )}

          {showDeliverable && scenario.deliverable && (
            <div className="flex flex-col gap-2.5">
              <DeliverableCard deliverable={scenario.deliverable} locked={locked} citations={allCitations} />
              {scenario.extraDeliverable && (
                <DeliverableCard deliverable={scenario.extraDeliverable} locked={locked} />
              )}
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
              style={{ background: "var(--accent-solid)" }}
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
