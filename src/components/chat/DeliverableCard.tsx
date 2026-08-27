import { Download, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Citation, Deliverable } from "../../lib/types";
import { CitationRow } from "../common/CitationRow";
import { exportDeliverable } from "../../lib/exportFile";
import { DELIVERABLE_ICON, DELIVERABLE_COLOR } from "../../lib/deliverableStyle";
import { usePreview } from "../../lib/previewContext";

export function DeliverableCard({
  deliverable,
  locked,
  citations = [],
}: {
  deliverable: Deliverable;
  locked: boolean;
  citations?: Citation[];
}) {
  const [exporting, setExporting] = useState(false);
  const { open } = usePreview();
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
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--bg-sunken)", color }}
          >
            <Icon size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
              {deliverable.name}
            </p>
            <p className="truncate text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {deliverable.summary}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => open(deliverable, locked)}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            onClick={handleExport}
            disabled={locked || exporting}
            title={locked ? "Awaiting approval before export" : `Download as .${deliverable.name.split(".").pop()}`}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-45"
            style={{ background: "var(--accent-solid)" }}
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {exporting ? "Preparing" : "Export"}
          </button>
        </div>
      </div>

      {citations.length > 0 && (
        <div className="px-4 pb-3">
          <CitationRow citations={citations} />
        </div>
      )}
    </div>
  );
}
