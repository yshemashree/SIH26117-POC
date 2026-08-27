import { useState } from "react";
import { Play, FileCode2, WifiOff, Box, Loader2, CheckCircle2, Download } from "lucide-react";
import { SCENARIOS } from "../../lib/data";
import { CodeBlock } from "../common/CodeBlock";
import { exportSourceFile } from "../../lib/exportFile";

const scenario = SCENARIOS.find((s) => s.id === "flare-kod-sizing")!;
const mainCode = scenario.steps.find((s) => s.id === "s3")!.code!;
const testCode = scenario.steps.find((s) => s.id === "s4")!.code!;
const testOutput = scenario.steps.find((s) => s.id === "s5")!.output!;

const FILES = [
  { name: "kod_sizing.py", code: mainCode },
  { name: "test_kod_sizing.py", code: testCode },
];

export function Sandbox() {
  const [active, setActive] = useState(0);
  const [runState, setRunState] = useState<"idle" | "running" | "done">("idle");

  const run = () => {
    setRunState("running");
    setTimeout(() => setRunState("done"), 900);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div
        className="flex items-center justify-between border-b px-5 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Box size={14} style={{ color: "var(--text-tertiary)" }} />
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
          style={{ background: "var(--accent-strong)" }}
        >
          {runState === "running" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          Run tests
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="w-52 shrink-0 border-r p-2" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="mb-1.5 px-1.5 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            Working directory
          </p>
          {FILES.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActive(i)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors"
              style={{
                background: active === i ? "var(--bg-selected)" : "transparent",
                color: active === i ? "var(--accent-strong)" : "var(--text-primary)",
              }}
            >
              <FileCode2 size={13} style={{ color: "var(--text-tertiary)" }} />
              {f.name}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="mono text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{FILES[active].name}</span>
              <button
                onClick={() => exportSourceFile(FILES[active].name, FILES[active].code)}
                className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <Download size={11} />
                Download
              </button>
            </div>
            <CodeBlock code={FILES[active].code} lang="python" />
          </div>

          <div className="border-t p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
              Console
            </p>
            <div
              className="mono min-h-[64px] rounded-md border px-3 py-2.5 text-[12px] leading-relaxed"
              style={{ background: "var(--bg-sunken)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            >
              {runState === "idle" && <span style={{ color: "var(--text-tertiary)" }}>Idle. Run tests to execute inside the isolated sandbox.</span>}
              {runState === "running" && (
                <span className="flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> pytest -q test_kod_sizing.py
                </span>
              )}
              {runState === "done" && (
                <div>
                  <p className="flex items-center gap-1.5" style={{ color: "var(--safe-600)" }}>
                    <CheckCircle2 size={13} /> pytest -q test_kod_sizing.py
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{testOutput}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
