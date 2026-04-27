"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { WeekBucket, CategoryBucket, ExpenseRow } from "@/lib/analytics";

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const LS_BUDGET = "budget_monthly_rsd";
const LS_RENT = "budget_fixed_rent_eur";
const LS_UTILITIES = "budget_fixed_utilities_rsd";
const LS_LOAN = "budget_fixed_loan_rub";

function readLS(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  if (!v) return fallback;
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

function fmtOrig(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface EditableNumberProps {
  value: number;
  lsKey: string;
  onChange: (v: number) => void;
  suffix?: string;
}

function EditableNumber({ value, lsKey, onChange, suffix }: EditableNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) {
      localStorage.setItem(lsKey, String(n));
      onChange(n);
    } else {
      setDraft(String(value));
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(String(value)); setEditing(false); } }}
        className="bg-zinc-800 text-white rounded-lg px-2 py-0.5 text-sm w-28 outline-none focus:ring-1 focus:ring-white/30"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="text-white font-semibold underline decoration-dotted underline-offset-2 hover:text-zinc-300 transition-colors"
    >
      {fmt(value)}{suffix ? ` ${suffix}` : ""}
    </button>
  );
}

interface Props {
  year: number;
  month: number;
  totalSpent: number;
  weekBuckets: WeekBucket[];
  categoryBuckets: CategoryBucket[];
  fxRates: { EUR: number; RUB: number; RSD: number };
  expenses: ExpenseRow[];
}

export default function AnalyticsClient({
  year,
  month,
  totalSpent,
  weekBuckets,
  categoryBuckets,
  fxRates,
  expenses,
}: Props) {
  const router = useRouter();

  const [budget, setBudget] = useState(() => readLS(LS_BUDGET, 210600));
  const [rent, setRent] = useState(() => readLS(LS_RENT, 800));
  const [utilities, setUtilities] = useState(() => readLS(LS_UTILITIES, 25000));
  const [loan, setLoan] = useState(() => readLS(LS_LOAN, 21560));

  // Гидратация из localStorage после монтирования
  useEffect(() => {
    setBudget(readLS(LS_BUDGET, 210600));
    setRent(readLS(LS_RENT, 800));
    setUtilities(readLS(LS_UTILITIES, 25000));
    setLoan(readLS(LS_LOAN, 21560));
  }, []);

  const rentRsd = rent * fxRates.EUR;
  const loanRsd = loan * fxRates.RUB;
  const fixedTotal = rentRsd + utilities + loanRsd;
  const remaining = budget - fixedTotal;
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyBudget = remaining / daysInMonth;
  const weeklyBudget = dailyBudget * 7;

  const now = new Date();
  const isCurrentOrFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);

  function navigate(deltaMonth: number) {
    let newMonth = month + deltaMonth;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    router.push(`/analytics?year=${newYear}&month=${newMonth}`);
  }

  const maxCategory = categoryBuckets[0]?.total ?? 1;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-5 gap-5 pb-10">
      {/* Шапка */}
      <div className="flex items-center justify-between mt-2">
        <a href="/" className="text-zinc-400 text-sm hover:text-white transition-colors">← Назад</a>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
          >
            ←
          </button>
          <span className="text-white font-semibold text-base">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={() => navigate(1)}
            disabled={isCurrentOrFuture}
            className="text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
        <div className="w-12" />
      </div>

      {/* Бюджет */}
      <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-zinc-400 text-sm font-medium">Бюджет на месяц</p>
        <div className="flex items-baseline gap-2">
          <EditableNumber value={budget} lsKey={LS_BUDGET} onChange={setBudget} />
          <span className="text-zinc-500 text-sm">RSD</span>
        </div>

        <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Обязательные расходы</p>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Аренда</span>
            <div className="flex items-center gap-1.5">
              <EditableNumber value={rent} lsKey={LS_RENT} onChange={setRent} suffix="EUR" />
              <span className="text-zinc-600 text-xs">≈ {fmt(rentRsd)} RSD</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Коммуналка</span>
            <div className="flex items-center gap-1.5">
              <EditableNumber value={utilities} lsKey={LS_UTILITIES} onChange={setUtilities} suffix="RSD" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Кредит</span>
            <div className="flex items-center gap-1.5">
              <EditableNumber value={loan} lsKey={LS_LOAN} onChange={setLoan} suffix="RUB" />
              <span className="text-zinc-600 text-xs">≈ {fmt(loanRsd)} RSD</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Остаток на месяц</span>
            <span className="text-white font-semibold">{fmt(remaining)} RSD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">В день</span>
            <span className="text-white">{fmt(dailyBudget)} RSD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">В неделю</span>
            <span className="text-white">{fmt(weeklyBudget)} RSD</span>
          </div>
        </div>
      </div>

      {/* Итого за месяц */}
      <div className={`rounded-2xl p-4 flex items-center justify-between ${totalSpent > remaining ? "bg-red-950/40" : "bg-zinc-900"}`}>
        <p className="text-zinc-400 text-sm">Потрачено за месяц</p>
        <p className={`font-bold text-xl ${totalSpent > remaining ? "text-red-400" : "text-white"}`}>
          {fmt(totalSpent)} RSD
        </p>
      </div>

      {/* По неделям */}
      {weekBuckets.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-zinc-400 text-sm font-medium">По неделям</p>
          <div className="flex flex-col gap-2">
            {weekBuckets.map((w) => {
              const over = w.total > weeklyBudget && weeklyBudget > 0;
              return (
                <div
                  key={w.label}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 ${over ? "bg-red-950/40" : "bg-zinc-800/60"}`}
                >
                  <span className="text-zinc-400 text-sm">{w.label}</span>
                  <span className={`font-semibold text-sm ${over ? "text-red-400" : "text-white"}`}>
                    {fmt(w.total)} RSD
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* По категориям */}
      {categoryBuckets.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-zinc-400 text-sm font-medium">По категориям</p>
          <div className="flex flex-col gap-2">
            {categoryBuckets.map((c) => (
              <div key={c.category} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">{c.category}</span>
                  <span className="text-white text-sm font-medium">{fmt(c.total)} RSD</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/30 rounded-full"
                    style={{ width: `${(c.total / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Все записи */}
      {expenses.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-zinc-400 text-sm font-medium">Все записи</p>
          <div className="flex flex-col gap-1">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-start justify-between py-2 border-b border-zinc-800/60 last:border-0 gap-3">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs">{fmtDate(e.entry_date)}</span>
                    <span className="text-zinc-400 text-xs">{e.category}</span>
                  </div>
                  {e.note && <span className="text-zinc-600 text-xs truncate">{e.note}</span>}
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-white text-sm font-medium">{fmt(e.amount_rsd)} RSD</span>
                  {e.currency !== "RSD" && (
                    <span className="text-zinc-500 text-xs">{fmtOrig(e.amount, e.currency)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <p className="text-zinc-600 text-base">Нет записей за этот месяц</p>
        </div>
      )}
    </div>
  );
}
