"use client";

import { useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

export type FloatingSection = "add" | "history";

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0" strokeWidth={2}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** iOS-like spring approximation (UIKit default-ish ease-out) */
const TAB_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";

function navigateWithViewTransition(router: ReturnType<typeof useRouter>, href: string) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(() => {
      flushSync(() => {
        router.push(href);
      });
    });
  } else {
    router.push(href);
  }
}

type Props = {
  /** Если не передан — активная вкладка по `usePathname()` */
  active?: FloatingSection;
  className?: string;
};

export default function FloatingSectionNav({ active: activeProp, className }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const active: FloatingSection =
    activeProp ?? (pathname.startsWith("/analytics") ? "history" : "add");

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/analytics");
  }, [router]);

  const go = useCallback(
    (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      e.preventDefault();
      navigateWithViewTransition(router, href);
    },
    [router],
  );

  return (
    <nav
      className={`floating-section-nav pointer-events-auto fixed z-50 ${className ?? ""}`}
      style={{
        left: "max(16px, env(safe-area-inset-left, 0px))",
        bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
        fontFamily:
          "ui-rounded, system-ui, -apple-system, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
      }}
      aria-label="Разделы приложения"
      role="tablist"
    >
      <div className="relative flex gap-1 rounded-[100px] border border-white/20 bg-white/[0.14] p-1 shadow-[0_12px_48px_rgba(0,0,0,0.42)] backdrop-blur-2xl backdrop-saturate-[1.35] [-webkit-backdrop-filter:blur(24px)_saturate(1.35)]">
        <span
          className="floating-section-nav__pill pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-[100px] bg-white/[0.28]"
          style={{
            transform: active === "add" ? "translate3d(0,0,0)" : "translate3d(calc(100% + 4px),0,0)",
            transition: `transform 0.48s ${TAB_SPRING}`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
          aria-hidden
        />
        <a
          href="/"
          role="tab"
          aria-selected={active === "add"}
          className={`relative z-10 flex min-w-[76px] flex-col items-center justify-center gap-0.5 rounded-[100px] py-2 px-2 text-[11px] font-semibold leading-none tracking-[-0.01em] transition-[color,opacity] duration-200 [-webkit-tap-highlight-color:transparent] ${
            active === "add" ? "text-[#c8cbff]" : "text-white/55 active:text-white/85"
          }`}
          onClick={(e) => go("/", e)}
        >
          <IconPlus />
          Add
        </a>
        <a
          href="/analytics"
          role="tab"
          aria-selected={active === "history"}
          className={`relative z-10 flex min-w-[76px] flex-col items-center justify-center gap-0.5 rounded-[100px] py-2 px-2 text-[11px] font-semibold leading-none tracking-[-0.01em] transition-[color,opacity] duration-200 [-webkit-tap-highlight-color:transparent] ${
            active === "history" ? "text-[#c8cbff]" : "text-white/55 active:text-white/85"
          }`}
          onClick={(e) => go("/analytics", e)}
        >
          <IconClock />
          History
        </a>
      </div>
    </nav>
  );
}
