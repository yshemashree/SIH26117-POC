import { FileText, FileSpreadsheet, Presentation, Code2 } from "lucide-react";
import type { Deliverable } from "./types";

export const DELIVERABLE_ICON: Record<Deliverable["type"], typeof FileText> = {
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
  code: Code2,
};

export const DELIVERABLE_COLOR: Record<Deliverable["type"], string> = {
  docx: "var(--brand-700)",
  xlsx: "var(--safe-600)",
  pptx: "var(--copper-600)",
  code: "var(--accent)",
};
