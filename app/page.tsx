"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CURRENCIES, CATEGORIES } from "@/lib/validate";
import type { Currency, Category } from "@/lib/validate";
import DateBadge from "./components/DateBadge";
import AmountPill from "./components/AmountPill";
import CategoryPills from "./components/CategoryPills";
import CommentInput from "./components/CommentInput";
import SaveButton from "./components/SaveButton";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type FormState = "idle" | "loading" | "success" | "error";

export default function ExpensePage() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("RSD");
  const [category, setCategory] = useState<Category | "">("");
  const [entryDate, setEntryDate] = useState(today());
  const [note, setNote] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [savedAmountRsd, setSavedAmountRsd] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [showTokenSetup, setShowTokenSetup] = useState(false);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) {
      localStorage.setItem("api_token", urlToken);
      setSavedToken(urlToken);
    } else {
      const stored = localStorage.getItem("api_token");
      setSavedToken(stored);
      if (!stored) setShowTokenSetup(true);
    }
  }, []);

  function saveToken() {
    const t = tokenInput.trim();
    if (!t) return;
    localStorage.setItem("api_token", t);
    setSavedToken(t);
    setShowTokenSetup(false);
    setTokenInput("");
  }

  const amountNum = parseFloat(amount);
  const amountValid = amount !== "" && !isNaN(amountNum) && amountNum > 0;
  const isValid = amountValid && category !== "" && entryDate !== "";

  async function handleSubmit() {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setState("loading");
    setErrorMsg("");

    const token =
      new URLSearchParams(window.location.search).get("token") ??
      localStorage.getItem("api_token") ??
      "";

    try {
      const res = await fetch(`/api/expenses?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          currency,
          category,
          entry_date: entryDate,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("api_token");
        setSavedToken(null);
        setShowTokenSetup(true);
        setState("idle");
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        const msg = json.errors
          ? json.errors.map((e: { field: string; message: string }) => e.message).join(", ")
          : json.error ?? "Ошибка сервера";
        setErrorMsg(msg);
        setState("error");
        return;
      }

      setSavedAmountRsd(json.amount_rsd);
      setState("success");
    } catch {
      setErrorMsg("Нет соединения с сервером");
      setState("error");
    }
  }

  function handleAddMore() {
    setAmount("");
    setCategory("");
    setEntryDate(today());
    setNote("");
    setState("idle");
    setSavedAmountRsd(null);
    setShowErrors(false);
  }

  // ⚠️ Figma: нет экрана токена
  if (showTokenSetup) {
    return (
      <main className="fixed inset-0 flex flex-col items-center justify-center p-6 gap-4">
        <img src="/bg.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none -z-10" />
        <div className="relative z-10 w-full max-w-sm flex flex-col gap-4">
          <p className="text-white text-xl font-neue font-bold text-center">Введи токен доступа</p>
          <p className="text-white/60 text-sm font-neue font-medium text-center">Нужно сделать один раз</p>
          <input
            autoFocus
            type="text"
            placeholder="Токен"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveToken(); }}
            className="w-full bg-white/20 backdrop-blur text-white rounded-2xl px-5 py-4 outline-none placeholder:text-white/40 font-neue font-medium text-base"
          />
          <button
            onClick={saveToken}
            disabled={!tokenInput.trim()}
            className="w-full bg-white text-black font-neue font-bold text-lg py-4 rounded-2xl disabled:opacity-30 active:opacity-80 transition-opacity"
          >
            Сохранить
          </button>
        </div>
      </main>
    );
  }

  // ⚠️ Figma: нет экрана успеха
  if (state === "success") {
    return (
      <main className="fixed inset-0 flex flex-col items-center justify-center p-6 gap-6">
        <img src="/bg.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none -z-10" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center text-[#ff6c26] text-3xl font-neue font-bold">
            ✓
          </div>
          <p className="text-white text-xl font-neue font-bold text-center">Расход сохранён</p>
          {savedAmountRsd !== null && (
            <p className="text-white/70 text-base font-neue font-medium text-center">
              ≈ {savedAmountRsd.toLocaleString("ru-RU")} RSD
            </p>
          )}
          <button
            onClick={handleAddMore}
            className="mt-4 bg-white text-black font-neue font-bold text-lg px-8 py-4 rounded-full active:opacity-80"
          >
            Добавить ещё
          </button>
        </div>
      </main>
    );
  }

  return (
    /*
     * fixed inset-0: страница не скроллится без overflow:hidden
     * (overflow:hidden ломает нативный date picker в iOS Safari)
     */
    <main className="fixed inset-0 flex flex-col px-[8px]">
      <img src="/bg.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none -z-10" />

      {/* Heading + аналитика */}
      <div className="relative shrink-0">
        <h1 className="font-neue font-bold text-[137px] leading-[123px] text-white whitespace-pre-wrap" style={{ paddingTop: "max(61px, env(safe-area-inset-top))" }}>
          {"Hello,\nVika"}
        </h1>
        <Link
          href="/analytics"
          className="absolute right-0 text-white/40 text-xs font-neue font-medium px-1 py-1"
          style={{ top: "max(16px, env(safe-area-inset-top))" }}
        >
          аналитика →
        </Link>
      </div>

      {/* Дата + сумма */}
      <div className="mt-[77px] flex gap-[4px] shrink-0">
        <DateBadge date={entryDate} onChange={setEntryDate} />
        <AmountPill
          amount={amount}
          currency={currency}
          onAmountChange={(v) => { setAmount(v); if (showErrors) setShowErrors(false); }}
          onCurrencyChange={setCurrency}
          showError={showErrors && !amountValid}
        />
      </div>

      {/* ⚠️ Figma: нет error-состояния сервера */}
      {state === "error" && (
        <p className="mt-[8px] shrink-0 text-red-300 text-sm font-neue font-medium">{errorMsg}</p>
      )}

      {/* Категории */}
      <div className="mt-[16px] flex-1">
        <CategoryPills
          selected={category}
          onSelect={(c) => { setCategory(c === category ? "" : c); if (showErrors) setShowErrors(false); }}
        />
        {/* ⚠️ Figma: нет ошибки валидации — подсказка при незаполненной категории */}
        {showErrors && !category && (
          <p className="mt-[8px] text-white/70 text-sm font-neue font-medium text-center">
            Выбери категорию
          </p>
        )}
      </div>

      {/* Комментарий + Save */}
      <div
        className="flex gap-[8px] items-start shrink-0"
        style={{ paddingBottom: "max(30px, env(safe-area-inset-bottom))" }}
      >
        <CommentInput value={note} onChange={setNote} />
        <SaveButton onPress={handleSubmit} loading={state === "loading"} />
      </div>

      {/* Скрытая кнопка смены токена */}
      <span className="absolute left-3 text-white/20 text-xs font-neue font-medium" style={{ bottom: "8px" }}>
        v15
      </span>
      {savedToken && (
        <button
          onClick={() => {
            localStorage.removeItem("api_token");
            setSavedToken(null);
            setShowTokenSetup(true);
          }}
          className="absolute right-3 text-white/20 text-xs font-neue font-medium"
          style={{ bottom: "8px" }}
        >
          ••• токен
        </button>
      )}
    </main>
  );
}
