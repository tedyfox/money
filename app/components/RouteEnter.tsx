"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const BODY_CLASS = "app-route-enter-pulse";

/**
 * Запускает CSS-анимацию на `.app-vt-page` при смене pathname.
 * Работает в Safari / PWA там, где View Transitions API для client-router не срабатывает.
 */
export default function RouteEnter() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const body = document.body;
    body.classList.remove(BODY_CLASS);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.add(BODY_CLASS);
      });
    });
    const tid = window.setTimeout(() => {
      body.classList.remove(BODY_CLASS);
    }, 550);
    return () => {
      window.clearTimeout(tid);
      body.classList.remove(BODY_CLASS);
    };
  }, [pathname]);

  return null;
}
