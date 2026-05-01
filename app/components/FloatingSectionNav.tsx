"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type FloatingSection = "add" | "history";

/** Figma: Tab Bar - iPhone, node 17:217 — https://www.figma.com/design/1UVPdhfElUOc91lNmcMm8a/Траты?node-id=17-217 */

const TAB_W = 102;
const TAB_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";

function IconPlus() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-inherit transition-colors duration-300"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-inherit transition-colors duration-300"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
        left: 0,
        bottom: 0,
        paddingLeft: "max(25px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(25px, env(safe-area-inset-right, 0px))",
        paddingBottom: "max(25px, env(safe-area-inset-bottom, 0px))",
        paddingTop: "16px",
        fontFamily:
          "ui-rounded, system-ui, -apple-system, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
      }}
      aria-label="Разделы приложения"
      role="tablist"
    >
      <div className="relative inline-flex items-stretch justify-center pl-[2px] pr-[10px]">
        {/* BG: Figma node I17:217;5538:24128 — fill + shadow + blend layers */}
        <div className="pointer-events-none absolute -inset-[4px] overflow-hidden rounded-[296px]">
          <div
            className="absolute inset-0 rounded-[296px] shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)]"
            aria-hidden
          >
            <div className="pointer-events-none absolute inset-0 rounded-[296px]">
              <div className="absolute inset-0 rounded-[296px] bg-[rgba(255,255,255,0.65)]" />
              <div className="absolute inset-0 rounded-[296px] bg-[#ddd] mix-blend-color-burn" />
              <div className="absolute inset-0 rounded-[296px] bg-[#f7f7f7] mix-blend-darken" />
            </div>
          </div>
        </div>

        {/* Selection «каретка» — fills---vibrant/tertiary */}
        <span
          className="floating-section-nav__pill pointer-events-none absolute left-[2px] top-[2px] z-0 rounded-[100px] bg-[var(--tab-selection-bg)]"
          style={{
            width: TAB_W,
            bottom: 2,
            transform:
              active === "add" ? "translate3d(0,0,0)" : `translate3d(${TAB_W}px,0,0)`,
            transition: `transform 0.52s ${TAB_SPRING}`,
            willChange: "transform",
          }}
          aria-hidden
        />

        <Link
          href="/"
          prefetch
          scroll={false}
          role="tab"
          aria-selected={active === "add"}
          style={{
            width: TAB_W,
            color: active === "add" ? "var(--tab-active-fg)" : "var(--tab-inactive-fg)",
          }}
          className="relative z-10 flex shrink-0 flex-col items-center justify-center gap-px px-2 pb-[7px] pt-[6px] text-center transition-[color] duration-300 [-webkit-tap-highlight-color:transparent]"
        >
          <div className="flex h-7 w-full items-center justify-center leading-[0] text-inherit">
            <IconPlus />
          </div>
          <p
            className="w-full text-[10px] font-semibold leading-[12px] tracking-[-0.1px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Add
          </p>
        </Link>
        <Link
          href="/analytics"
          prefetch
          scroll={false}
          role="tab"
          aria-selected={active === "history"}
          style={{
            width: TAB_W,
            color: active === "history" ? "var(--tab-active-fg)" : "var(--tab-inactive-fg)",
          }}
          className="relative z-10 flex shrink-0 flex-col items-center justify-center gap-px px-2 pb-[7px] pt-[6px] text-center transition-[color] duration-300 [-webkit-tap-highlight-color:transparent]"
        >
          <div className="flex h-7 w-full items-center justify-center leading-[0] text-inherit">
            <IconClock />
          </div>
          <p
            className="w-full text-[10px] font-semibold leading-[12px] tracking-[-0.1px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            History
          </p>
        </Link>
      </div>
    </nav>
  );
}
