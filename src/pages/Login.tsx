import { useState } from "react";
import { Lock, ShieldCheck, WifiOff, Sun, Moon, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { RakshakaMark, RakshakaWordmark, MrplBadge } from "../components/common/Logo";
import { GoogleGlyph } from "../components/common/GoogleGlyph";

const ASSURANCES = [
  { icon: WifiOff, text: "No data or model call leaves the refinery network" },
  { icon: Lock, text: "Session bound to a single isolated GPU slot" },
  { icon: ShieldCheck, text: "Every task and export is written to the audit trail" },
];

export default function Login() {
  const { signIn, signingIn } = useAuth();
  const { theme, toggle } = useTheme();
  const [ssoLoading, setSsoLoading] = useState(false);

  return (
    <div className="flex min-h-screen w-full" style={{ background: "var(--bg-canvas)" }}>
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="fixed right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div
        className="relative hidden w-[46%] flex-col justify-between overflow-hidden px-12 py-14 lg:flex"
        style={{ background: "var(--brand-900)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <RakshakaMark size={30} />
          <RakshakaWordmark className="text-xl text-white" />
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--copper-300)" }}>
            On-premises AI workbench
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-tight text-white">
            Agentic AI for refinery operations, running entirely inside the plant network.
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--brand-200)" }}>
            Rakshaka is the Kannada word for protector. This workbench reads, drafts and
            reasons over confidential engineering, HSE and inspection records without a
            single byte reaching the public internet.
          </p>

          <ul className="mt-9 flex flex-col gap-3.5">
            {ASSURANCES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon size={14} style={{ color: "var(--copper-300)" }} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2.5 border-t pt-5 text-xs" style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--brand-300)" }}>
          <MrplBadge />
          Deployed for Mangalore Refinery and Petrochemicals Limited
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <RakshakaMark size={26} />
            <RakshakaWordmark className="text-lg" style={{ color: "var(--text-primary)" }} />
          </div>

          <div
            className="rounded-xl border p-8 shadow-sm"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Sign in to Rakshaka.AI
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Use your MRPL Google Workspace account to continue.
            </p>

            <button
              onClick={() => signIn()}
              disabled={signingIn || ssoLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-70"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-strong)",
                color: "var(--text-primary)",
              }}
            >
              {signingIn ? <Loader2 size={16} className="animate-spin" /> : <GoogleGlyph size={17} />}
              {signingIn ? "Verifying with Google Workspace" : "Sign in with Google"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
              <span className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
            </div>

            <button
              onClick={() => {
                setSsoLoading(true);
                setTimeout(() => signIn(), 700);
              }}
              disabled={signingIn || ssoLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-70"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              {ssoLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
              Continue with company SSO
            </button>

            <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              By continuing you agree this session is logged for security and audit
              purposes under MRPL IT policy. Access is restricted to authorized personnel.
            </p>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
            Trouble signing in? Contact the Digital Systems desk, extension 2210.
          </p>
        </div>
      </div>
    </div>
  );
}
