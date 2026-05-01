"use client";

import Link from "next/link";

export type FloatingSection = "add" | "history";

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  active: FloatingSection;
  className?: string;
};

export default function FloatingSectionNav({ active, className }: Props) {
  return (
    <nav
      className={`pointer-events-auto fixed z-50 ${className ?? ""}`}
      style={{
        left: "max(16px, env(safe-area-inset-left, 0px))",
        bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Разделы приложения"
    >
      <div className="relative inline-grid grid-cols-2 rounded-full border border-white/18 bg-white/[0.12] p-1 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150">
        <div
          className={`pointer-events-none absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-full bg-white/20 transition-[left] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            active === "add" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
          aria-hidden
        />
        <Link
          href="/"
          prefetch
          className={`relative z-10 flex min-w-[76px] flex-col items-center justify-center gap-0.5 rounded-full py-2 px-2 text-[11px] font-semibold tracking-wide transition-colors ${
            active === "add"
              ? "text-violet-300"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          aria-current={active === "add" ? "page" : undefined}
        >
          <IconPlus />
          Add
        </Link>
        <Link
          href="/analytics"
          prefetch
          className={`relative z-10 flex min-w-[76px] flex-col items-center justify-center gap-0.5 rounded-full py-2 px-2 text-[11px] font-semibold tracking-wide transition-colors ${
            active === "history"
              ? "text-violet-300"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          aria-current={active === "history" ? "page" : undefined}
        >
          <IconClock />
          History
        </Link>
      </div>
    </nav>
  );
}
