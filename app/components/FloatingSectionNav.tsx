"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type FloatingSection = "add" | "history";

/** Нижний переключатель Add / History — Figma node 17-217, токен активного цвета в globals.css */

function IconPlus({ active }: { active: boolean }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 transition-[stroke,opacity] duration-300"
      stroke={active ? "var(--tab-active-fg)" : "rgba(255,255,255,0.55)"}
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconClock({ active }: { active: boolean }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 transition-[stroke,opacity] duration-300"
      stroke={active ? "var(--tab-active-fg)" : "rgba(255,255,255,0.55)"}
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Пружина как у UIKit ease-out по умолчанию */
const TAB_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";

type Props = {
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

  return (
    <nav
      className={`floating-section-nav pointer-events-auto fixed z-50 ${className ?? ""}`}
      style={{
        left: "max(14px, env(safe-area-inset-left, 0px))",
        bottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        fontFamily:
          "ui-rounded, system-ui, -apple-system, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
      }}
      aria-label="Разделы приложения"
      role="tablist"
    >
      <div
        className="relative flex w-[min(100vw-28px,220px)] gap-[3px] rounded-[28px] border p-[3px] shadow-[0_10px_36px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.12)_inset]"
        style={{
          borderColor: "rgba(255,255,255,0.22)",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(44px) saturate(1.65)",
          WebkitBackdropFilter: "blur(44px) saturate(1.65)",
        }}
      >
        <span
          className="floating-section-nav__pill pointer-events-none absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-4.5px)] rounded-[22px]"
          style={{
            transform: active === "add" ? "translate3d(0,0,0)" : "translate3d(calc(100% + 3px),0,0)",
            transition: `transform 0.52s ${TAB_SPRING}`,
            willChange: "transform",
            background: "rgba(255,255,255,0.34)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.12)",
          }}
          aria-hidden
        />
        <Link
          href="/"
          prefetch
          scroll={false}
          role="tab"
          aria-selected={active === "add"}
          className={`relative z-10 flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-[22px] py-1.5 text-[11px] font-semibold leading-none tracking-[-0.02em] transition-colors duration-300 [-webkit-tap-highlight-color:transparent] ${
            active === "add" ? "text-[var(--tab-active-fg)]" : "text-white/60 active:text-white/85"
          }`}
        >
          <IconPlus active={active === "add"} />
          Add
        </Link>
        <Link
          href="/analytics"
          prefetch
          scroll={false}
          role="tab"
          aria-selected={active === "history"}
          className={`relative z-10 flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-[22px] py-1.5 text-[11px] font-semibold leading-none tracking-[-0.02em] transition-colors duration-300 [-webkit-tap-highlight-color:transparent] ${
            active === "history" ? "text-[var(--tab-active-fg)]" : "text-white/60 active:text-white/85"
          }`}
        >
          <IconClock active={active === "history"} />
          History
        </Link>
      </div>
    </nav>
  );
}
