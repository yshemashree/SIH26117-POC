import { useEffect, useRef, useState } from "react";
import {
  Play,
  FileCode2,
  FileText as FileTextIcon,
  WifiOff,
  Loader2,
  CheckCircle2,
  Download,
  ChevronDown,
  FolderOpen,
  X,
  GitBranch,
  Circle,
} from "lucide-react";
import { SCENARIOS, SESSION_ID } from "../../lib/data";
import { CodeBlock } from "../common/CodeBlock";
import { exportSourceFile } from "../../lib/exportFile";

const scenario = SCENARIOS.find((s) => s.id === "flare-kod-sizing")!;
const mainCode = scenario.steps.find((s) => s.id === "s3")!.code!;
const testCode = scenario.steps.find((s) => s.id === "s4")!.code!;
const testOutput = scenario.steps.find((s) => s.id === "s5")!.output!;

const FILES = [
  { name: "kod_sizing.py", code: mainCode, kind: "py" as const },
  { name: "test_kod_sizing.py", code: testCode, kind: "py" as const },
  { name: "requirements.txt", code: "numpy==1.26.4\npytest==8.2.0\n", kind: "text" as const },
  {
    name: "README.md",
    code: "# Flare KO drum sizing\n\nSizes a vertical flare knockout drum from vapor flow rate and\ndroplet size using the Souders-Brown terminal velocity method.\n\nVerified against the API 521 Appendix D worked example.\n\nRun `pytest -q` inside this sandbox to reproduce the result.\n",
    kind: "text" as const,
  },
];

const BOOT_LINES = [
  "$ rakshaka-sandbox boot",
  "[boot] agentic task engine attached, session " + SESSION_ID,
  "[boot] local model runtime: 6 models healthy",
  "[boot] python 3.11.9 kernel ready, network egress disabled",
  "[ready]",
];

export function Sandbox() {
  const [openTabs, setOpenTabs] = useState<number[]>([0, 1]);
  const [active, setActive] = useState(0);
  const [runState, setRunState] = useState<"idle" | "running" | "done">("idle");
  const [bootRevealed, setBootRevealed] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    BOOT_LINES.forEach((_, i) => {
      setTimeout(() => setBootRevealed((n) => Math.max(n, i + 1)), 180 * (i + 1));
    });
  }, []);

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [bootRevealed, runState]);

  const openFile = (i: number) => {
    setOpenTabs((prev) => (prev.includes(i) ? prev : [...prev, i]));
    setActive(i);
  };

  const closeTab = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((x) => x !== i);
      if (active === i && next.length > 0) setActive(next[next.length - 1]);
      return next;
    });
  };

  const run = () => {
    setRunState("running");
    setTimeout(() => setRunState("done"), 900);
  };

  const activeFile = active >= 0 ? FILES[active] : undefined;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div
        className="flex items-center justify-between border-b px-5 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>
            Python sandbox
          </span>
          <span
            className="rounded-full border px-2 py-0.5 text-[10.5px]"
            style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
          >
            python 3.11 · isolated
          </span>
          <span
            className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px]"
            style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
          >
            <WifiOff size={10} /> egress disabled
          </span>
        </div>
        <button
          onClick={run}
          disabled={runState === "running"}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors disabled:opacity-60"
          style={{ background: "var(--accent-solid)" }}
        >
          {runState === "running" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          Run tests
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex w-52 shrink-0 flex-col border-r p-2" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="mb-1 flex items-center gap-1 px-1 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            <ChevronDown size={12} />
            Explorer
          </div>
          <div className="mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
            <FolderOpen size={13} style={{ color: "var(--olive-600)" }} />
            rakshaka-sandbox
          </div>
          {FILES.map((f, i) => (
            <button
              key={f.name}
              onClick={() => openFile(i)}
              className="ml-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors"
              style={{
                background: active === i ? "var(--bg-selected)" : "transparent",
                color: active === i ? "var(--accent-strong)" : "var(--text-primary)",
              }}
            >
              {f.kind === "py" ? (
                <FileCode2 size={13} style={{ color: "var(--text-tertiary)" }} />
              ) : (
                <FileTextIcon size={13} style={{ color: "var(--text-tertiary)" }} />
              )}
              {f.name}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {openTabs.length > 0 && (
            <div className="flex items-stretch border-b" style={{ borderColor: "var(--border-subtle)" }}>
              {openTabs.map((i) => {
                const f = FILES[i];
                const isActive = active === i;
                return (
                  <button
                    key={f.name}
                    onClick={() => setActive(i)}
                    className="group flex items-center gap-2 border-r px-3 py-2 text-[12px] transition-colors"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background: isActive ? "var(--bg-surface)" : "var(--bg-sunken)",
                      color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                      borderBottom: isActive ? "2px solid var(--accent-solid)" : "2px solid transparent",
                    }}
                  >
                    {f.kind === "py" ? <FileCode2 size={12} /> : <FileTextIcon size={12} />}
                    {f.name}
                    <span
                      onClick={(e) => closeTab(i, e)}
                      className="rounded-sm p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <X size={11} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex-1 overflow-auto p-4">
            {activeFile ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="mono text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
                    rakshaka-sandbox / {activeFile.name}
                  </span>
                  <button
                    onClick={() => exportSourceFile(activeFile.name, activeFile.code)}
                    className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors"
                    style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    <Download size={11} />
                    Download
                  </button>
                </div>
                <CodeBlock code={activeFile.code} lang={activeFile.kind === "py" ? "python" : "text"} />
              </>
            ) : (
              <p className="text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>
                No file open. Select one from the explorer.
              </p>
            )}
          </div>

          <div className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center gap-4 border-b px-4 pt-2" style={{ borderColor: "var(--border-subtle)" }}>
              <span
                className="border-b-2 pb-2 text-[10.5px] font-semibold uppercase tracking-wide"
                style={{ borderColor: "var(--accent-solid)", color: "var(--text-primary)" }}
              >
                Terminal
              </span>
              <span className="pb-2 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                Problems
              </span>
              <span className="pb-2 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                Output
              </span>
            </div>
            <div
              ref={termRef}
              className="mono max-h-40 min-h-[110px] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed"
              style={{ background: "var(--bg-sunken)", color: "var(--text-secondary)" }}
            >
              {BOOT_LINES.slice(0, bootRevealed).map((line, i) => (
                <div key={i} style={{ color: line.startsWith("$") ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                  {line}
                </div>
              ))}
              {bootRevealed >= BOOT_LINES.length && runState === "idle" && (
                <div className="flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                  <span>$</span>
                  <span className="caret">▍</span>
                </div>
              )}
              {runState === "running" && (
                <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span>$ pytest -q test_kod_sizing.py</span>
                  <Loader2 size={12} className="animate-spin" />
                </div>
              )}
              {runState === "done" && (
                <div>
                  <p style={{ color: "var(--text-primary)" }}>$ pytest -q test_kod_sizing.py</p>
                  <p className="mt-1 flex items-center gap-1.5" style={{ color: "var(--safe-600)" }}>
                    <CheckCircle2 size={13} /> passed
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{testOutput}</pre>
                  <div className="mt-1 flex items-center gap-1">
                    <span>$</span>
                    <span className="caret">▍</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-4 px-4 py-1.5 text-[11px] text-white"
        style={{ background: "var(--accent-solid)" }}
      >
        <span className="flex items-center gap-1.5">
          <GitBranch size={11} />
          main
        </span>
        <span className="opacity-60">Python 3.11.9 (sandbox)</span>
        <span className="flex-1" />
        <span className="flex items-center gap-1.5">
          <Circle size={7} fill="currentColor" style={{ color: "var(--olive-500)" }} />
          Local inference connected
        </span>
        <span className="opacity-60">{SESSION_ID}</span>
        <span className="opacity-60">Ln 1, Col 1</span>
      </div>
    </div>
  );
}
