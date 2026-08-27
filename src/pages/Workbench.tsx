import { useState } from "react";
import { TopBar, Sidebar } from "../components/layout/AppShell";
import { ChatPanel } from "../components/chat/ChatPanel";
import { RightRail } from "../components/rail/RightRail";
import { KnowledgeBase } from "../components/knowledge/KnowledgeBase";
import { Sandbox } from "../components/sandbox/Sandbox";
import { Dashboard } from "../components/dashboard/Dashboard";
import { SCENARIOS } from "../lib/data";
import { buildGenericScenario } from "../lib/generic";
import type { AuditEntry, Scenario, Section, Turn } from "../lib/types";

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Workbench() {
  const [section, setSection] = useState<Section>("chat");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const runTurn = (scenario: Scenario) => {
    const id = `${scenario.id}-${Date.now()}`;
    const turn: Turn = { id, scenario, time: nowLabel(), revealCount: 0, approval: "none", exported: false };
    setTurns((prev) => [...prev, turn]);

    let cumulative = 0;
    scenario.steps.forEach((step, idx) => {
      cumulative += Math.min(step.durationMs ?? 400, 700) * 0.55 + 180;
      setTimeout(() => {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, revealCount: idx + 1, approval: step.kind === "approval" ? "pending" : t.approval }
              : t
          )
        );
      }, cumulative);
    });

    scenario.audit.forEach((entry, idx) => {
      setTimeout(() => {
        setAuditLog((prev) => [...prev, entry]);
      }, 200 * (idx + 1));
    });
  };

  const handleSend = (prompt: string, files: { name: string }[]) => {
    const match = SCENARIOS.find((s) => s.prompt === prompt);
    runTurn(match ?? buildGenericScenario(prompt, files.map((f) => f.name)));
  };

  const approveTurn = (turnId: string) => {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, approval: "approved", exported: true } : t)));
    setAuditLog((prev) => [
      ...prev,
      {
        id: `${turnId}-approve-${Date.now()}`,
        time: nowLabel(),
        actor: "you",
        category: "approval",
        message: "Deliverable approved and exported to local downloads",
      },
    ]);
  };

  const rejectTurn = (turnId: string) => {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, approval: "rejected" } : t)));
    setAuditLog((prev) => [
      ...prev,
      {
        id: `${turnId}-reject-${Date.now()}`,
        time: nowLabel(),
        actor: "you",
        category: "approval",
        message: "Deliverable rejected, returned to the agent queue for revision",
      },
    ]);
  };

  const activeTurn = turns[turns.length - 1];

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--bg-canvas)" }}>
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar section={section} onSection={setSection} turns={turns} />

        {section === "chat" && (
          <>
            <ChatPanel turns={turns} onSend={handleSend} onApprove={approveTurn} onReject={rejectTurn} />
            <RightRail auditLog={auditLog} activeTurn={activeTurn} />
          </>
        )}
        {section === "dashboard" && <Dashboard turns={turns} auditLog={auditLog} />}
        {section === "knowledge" && <KnowledgeBase />}
        {section === "sandbox" && <Sandbox />}
      </div>
    </div>
  );
}
