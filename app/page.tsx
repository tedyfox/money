"use client";

import { useState } from "react";
import { CURRENCIES, CATEGORIES } from "@/lib/validate";
import type { Currency, Category } from "@/lib/validate";

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

  const amountNum = parseFloat(amount);
  const isValid =
    amount !== "" && !isNaN(amountNum) && amountNum > 0 && category !== "" && entryDate !== "";

  async function handleSubmit() {
    if (!isValid) return;
    setState("loading");
    setErrorMsg("");

    const token = new URLSearchParams(window.location.search).get("token") ?? "";

    try {
      const res = await fetch(`/api/expenses?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, currency, category, entry_date: entryDate, ...(note.trim() ? { note: note.trim() } : {}) }),
      });

      if (res.status === 401) {
        setErrorMsg("Неверный токен доступа. Добавь ?token=... к URL.");
        setState("error");
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
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-6xl">✓</div>
        <p className="text-white text-xl font-medium text-center">Расход сохранён</p>
        {savedAmountRsd !== null && (
          <p className="text-zinc-400 text-base text-center">
            ≈ {savedAmountRsd.toLocaleString("ru-RU")} RSD
          </p>
        )}
        <button
          onClick={handleAddMore}
          className="mt-4 w-full max-w-sm bg-white text-black font-semibold text-lg py-4 rounded-2xl active:opacity-80"
        >
          Добавить ещё
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-5 gap-5 pb-10">
      <h1 className="text-white text-2xl font-bold mt-2">Новый расход</h1>

      {/* Amount */}
      <div className="flex flex-col gap-1">
        <label className="text-zinc-400 text-sm">Сумма</label>
        <input
          type="number"
          inputMode="decimal"
          autoFocus
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-zinc-900 text-white text-3xl font-semibold rounded-2xl px-5 py-4 outline-none placeholder:text-zinc-700 focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* Currency pills */}
      <div className="flex flex-col gap-1">
        <label className="text-zinc-400 text-sm">Валюта</label>
        <div className="flex gap-2 flex-wrap">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currency === c
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-300 active:bg-zinc-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <div className="flex flex-col gap-1">
        <label className="text-zinc-400 text-sm">Категория</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-300 active:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-zinc-400 text-sm">Дата</label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="bg-zinc-900 text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-white/20 text-base"
        />
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1">
        <label className="text-zinc-400 text-sm">Комментарий <span className="text-zinc-600">(необязательно)</span></label>
        <input
          type="text"
          placeholder="Например: Lidl, за ужин с Машей…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          className="bg-zinc-900 text-white rounded-2xl px-5 py-4 outline-none placeholder:text-zinc-700 focus:ring-2 focus:ring-white/20 text-base"
        />
      </div>

      {/* Error */}
      {state === "error" && (
        <p className="text-red-400 text-sm bg-red-950/40 rounded-xl px-4 py-3">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || state === "loading"}
        className="mt-auto w-full bg-white text-black font-semibold text-lg py-4 rounded-2xl disabled:opacity-30 active:opacity-80 transition-opacity"
      >
        {state === "loading" ? "Сохраняю…" : "Сохранить"}
      </button>
    </div>
  );
}
