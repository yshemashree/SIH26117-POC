import { useState } from "react";
import {
  MessageSquare,
  Library,
  TerminalSquare,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useTheme } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import { RakshakaMark, RakshakaWordmark, MrplBadge } from "../common/Logo";
import { SESSION_ID } from "../../lib/data";
import type { Section, Turn } from "../../lib/types";

const NAV: { id: Section; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Agent Chat", icon: MessageSquare },
  { id: "knowledge", label: "Knowledge Base", icon: Library },
  { id: "sandbox", label: "Sandbox", icon: TerminalSquare },
];

export function TopBar() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-4"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-3">
        <RakshakaMark size={24} />
        <RakshakaWordmark className="text-[15px]" />
        <span className="mx-1 h-5 w-px" style={{ background: "var(--border-default)" }} />
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <MrplBadge />
          <span>Mangalore Refinery and Petrochemicals Limited</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <ShieldCheck size={12} style={{ color: "var(--safe-500)" }} />
          Air gapped · session {SESSION_ID}
        </span>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md border py-1 pl-1 pr-2 transition-colors"
            style={{ borderColor: "var(--border-default)" }}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: "var(--brand-700)" }}
            >
              {user?.initials}
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              {user?.name}
            </span>
            <ChevronDown size={13} style={{ color: "var(--text-tertiary)" }} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-10 z-20 w-56 rounded-lg border py-1.5 shadow-lg"
              style={{ background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)" }}
            >
              <div className="border-b px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{user?.role}</p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{user?.department}</p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors"
                style={{ color: "var(--alert-600)" }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Sidebar({
  section,
  onSection,
  turns,
}: {
  section: Section;
  onSection: (s: Section) => void;
  turns: Turn[];
}) {
  return (
    <aside
      className="flex w-60 shrink-0 flex-col border-r"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <nav className="flex flex-col gap-0.5 p-3">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = section === id;
          return (
            <button
              key={id}
              onClick={() => onSection(id)}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors"
              style={{
                background: active ? "var(--bg-selected)" : "transparent",
                color: active ? "var(--accent-strong)" : "var(--text-secondary)",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 h-px" style={{ background: "var(--border-subtle)" }} />

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Recent tasks
        </p>
        {turns.length === 0 && (
          <p className="px-1 text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            Nothing run yet this session. Try a sample prompt from the composer.
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {[...turns].reverse().map((t) => (
            <li key={t.id}>
              <div
                className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[12px]"
                style={{ color: "var(--text-secondary)" }}
              >
                <Clock size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                <span className="line-clamp-2 leading-snug">{t.scenario.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t p-3 text-[11px] leading-relaxed" style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
        Rakshaka.AI v0.9 preview build · on-prem workbench
      </div>
    </aside>
  );
}
