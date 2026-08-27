import { createContext, useContext, useState, type ReactNode } from "react";
import type { Deliverable } from "./types";

interface PreviewState {
  deliverable: Deliverable;
  locked: boolean;
}

interface PreviewContextValue {
  state: PreviewState | null;
  open: (deliverable: Deliverable, locked: boolean) => void;
  close: () => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState | null>(null);
  return (
    <PreviewContext.Provider
      value={{
        state,
        open: (deliverable, locked) => setState({ deliverable, locked }),
        close: () => setState(null),
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) throw new Error("usePreview must be used within PreviewProvider");
  return ctx;
}
