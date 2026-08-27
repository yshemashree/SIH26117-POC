export type Capability =
  | "reasoning"
  | "coding"
  | "vision"
  | "ocr"
  | "embedding"
  | "reranking";

export interface LocalModel {
  id: string;
  name: string;
  family: string;
  params: string;
  quantization: string;
  contextWindow: string;
  vram: string;
  capabilities: Capability[];
  status: "healthy" | "degraded" | "offline";
  latencyMs: number;
  notes?: string;
}

export type TaskCategory =
  | "document-analysis"
  | "coding"
  | "knowledge-retrieval"
  | "multimodal-report";

export interface KbDoc {
  id: string;
  name: string;
  folder: string;
  kind: "pdf-scanned" | "pdf" | "image" | "xlsx" | "docx";
  pages?: number;
  size: string;
  updated: string;
  classification: "Internal" | "Confidential" | "Restricted";
  description: string;
}

export type StepKind =
  | "plan"
  | "tool-call"
  | "tool-result"
  | "model"
  | "approval"
  | "deliverable";

export interface AgentStep {
  id: string;
  kind: StepKind;
  title: string;
  detail?: string;
  tool?: string;
  modelId?: string;
  code?: string;
  codeLang?: string;
  output?: string;
  citations?: { doc: string; page: string }[];
  status?: "done" | "running" | "pending" | "blocked";
  durationMs?: number;
}

export interface Deliverable {
  type: "docx" | "xlsx" | "pptx" | "code";
  name: string;
  summary: string;
  sections?: { heading: string; body: string }[];
  rows?: string[][];
  code?: string;
  codeLang?: string;
}

export type Section = "chat" | "dashboard" | "knowledge" | "sandbox";

export type ApprovalState = "none" | "pending" | "approved" | "rejected";

export interface Turn {
  id: string;
  scenario: Scenario;
  time: string;
  revealCount: number;
  approval: ApprovalState;
  exported: boolean;
}

export interface AuditEntry {
  id: string;
  time: string;
  actor: string;
  category: "routing" | "tool" | "security" | "approval" | "export" | "system";
  message: string;
}

export interface Scenario {
  id: string;
  label: string;
  prompt: string;
  category: TaskCategory;
  categoryLabel: string;
  routedModelId: string;
  attachedFiles: string[];
  steps: AgentStep[];
  deliverable?: Deliverable;
  audit: AuditEntry[];
}
