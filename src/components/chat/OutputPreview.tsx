import { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { usePreview } from "../../lib/previewContext";
import { exportDeliverable } from "../../lib/exportFile";
import { DELIVERABLE_ICON, DELIVERABLE_COLOR } from "../../lib/deliverableStyle";
import { CodeBlock } from "../common/CodeBlock";

function colLabel(i: number) {
  return String.fromCharCode(65 + i);
}

function DocxPreview({ name, sections }: { name: string; sections: { heading: string; body: string }[] }) {
  const title = name.replace(/\.[^.]+$/, "").replace(/_/g, " ");
  return (
    <div className="mx-auto max-w-[560px] rounded-sm p-10 shadow-lg" style={{ background: "#ffffff", color: "#1c1c1c" }}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-2 h-px w-full" style={{ background: "#e4e4e0" }} />
      {sections.map((s) => (
        <div key={s.heading} className="mt-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8a8a82" }}>
            {s.heading}
          </h2>
          <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function PptxPreview({ sections }: { sections: { heading: string; body: string }[] }) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-4">
      {sections.map((s, i) => (
        <div
          key={s.heading}
          className="flex aspect-video w-full flex-col rounded-md p-6 shadow-lg"
          style={{ background: "#ffffff", color: "#1c1c1c" }}
        >
          <div className="h-1 w-14 rounded-full" style={{ background: "var(--copper-500)" }} />
          <h2 className="mt-3 text-lg font-semibold">{s.heading.replace(/^Slide \d+\s*·\s*/, "")}</h2>
          <p className="mt-3 flex-1 overflow-hidden text-[12.5px] leading-relaxed" style={{ color: "#4a4a44" }}>
            {s.body}
          </p>
          <p className="text-[10px]" style={{ color: "#a8a89f" }}>Slide {i + 1} of {sections.length}</p>
        </div>
      ))}
    </div>
  );
}

function XlsxPreview({ rows }: { rows: string[][] }) {
  const maxCols = Math.max(...rows.map((r) => r.length));
  return (
    <div className="mx-auto max-w-full overflow-auto rounded-md shadow-lg" style={{ background: "#ffffff" }}>
      <table className="border-collapse text-[12px]" style={{ color: "#1c1c1c" }}>
        <thead>
          <tr>
            <th className="w-8 border px-1.5 py-1" style={{ borderColor: "#e4e4e0", background: "#f4f4f0" }} />
            {Array.from({ length: maxCols }, (_, i) => (
              <th
                key={i}
                className="border px-2.5 py-1 text-center font-normal"
                style={{ borderColor: "#e4e4e0", background: "#f4f4f0", color: "#8a8a82" }}
              >
                {colLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td
                className="border px-1.5 text-center"
                style={{ borderColor: "#e4e4e0", background: "#f4f4f0", color: "#a8a89f" }}
              >
                {i + 1}
              </td>
              {Array.from({ length: maxCols }, (_, j) => (
                <td
                  key={j}
                  className="whitespace-nowrap border px-2.5 py-1"
                  style={{
                    borderColor: "#e4e4e0",
                    fontWeight: i === 0 ? 600 : 400,
                    background: i === 0 ? "#f4f4f0" : "transparent",
                  }}
                >
                  {row[j] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OutputPreview() {
  const { state, close } = usePreview();
  const [exporting, setExporting] = useState(false);

  if (!state) return null;
  const { deliverable, locked } = state;
  const Icon = DELIVERABLE_ICON[deliverable.type];
  const color = DELIVERABLE_COLOR[deliverable.type];

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDeliverable(deliverable);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 right-0 top-14 z-30 flex w-[480px] flex-col border-l shadow-2xl animate-fade-in"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--bg-sunken)", color }}
          >
            <Icon size={15} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{deliverable.name}</p>
            <p className="truncate text-[11px]" style={{ color: "var(--text-tertiary)" }}>{deliverable.summary}</p>
          </div>
        </div>
        <button
          onClick={close}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6" style={{ background: "var(--bg-sunken)" }}>
        {deliverable.type === "docx" && deliverable.sections && (
          <DocxPreview name={deliverable.name} sections={deliverable.sections} />
        )}
        {deliverable.type === "pptx" && deliverable.sections && <PptxPreview sections={deliverable.sections} />}
        {deliverable.type === "xlsx" && deliverable.rows && <XlsxPreview rows={deliverable.rows} />}
        {deliverable.type === "code" && deliverable.code && (
          <CodeBlock code={deliverable.code} lang={deliverable.codeLang ?? "python"} />
        )}
      </div>

      <div className="border-t p-3" style={{ borderColor: "var(--border-subtle)" }}>
        <button
          onClick={handleExport}
          disabled={locked || exporting}
          title={locked ? "Awaiting approval before export" : `Download as .${deliverable.name.split(".").pop()}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-45"
          style={{ background: "var(--accent-solid)" }}
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {exporting ? "Preparing" : locked ? "Awaiting approval" : "Export"}
        </button>
      </div>
    </div>
  );
}
