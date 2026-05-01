"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { WeekBucket, CategoryBucket, ExpenseRow } from "@/lib/analytics";
import { CATEGORIES } from "@/lib/validate";

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const CURRENCIES = ["RSD", "EUR", "RUB", "USD", "GEL"] as const;
type FxCurrency = typeof CURRENCIES[number];

const LS_BUDGET = "budget_monthly_rsd";
const LS_FIXED = "budget_fixed_expenses";

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: FxCurrency;
}

const DEFAULT_FIXED: FixedExpense[] = [
  { id: "rent", name: "Аренда", amount: 800, currency: "EUR" },
  { id: "utilities", name: "Коммуналка", amount: 25000, currency: "RSD" },
  { id: "loan", name: "Кредит", amount: 21560, currency: "RUB" },
];

function loadFixed(): FixedExpense[] {
  if (typeof window === "undefined") return DEFAULT_FIXED;
  try {
    const v = localStorage.getItem(LS_FIXED);
    if (!v) return DEFAULT_FIXED;
    return JSON.parse(v) as FixedExpense[];
  } catch {
    return DEFAULT_FIXED;
  }
}

function saveFixed(items: FixedExpense[]) {
  localStorage.setItem(LS_FIXED, JSON.stringify(items));
}

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
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// --- Inline editable text ---
function EditableText({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className="bg-zinc-800 text-white rounded-lg px-2 py-0.5 text-sm w-32 outline-none focus:ring-1 focus:ring-white/30"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="text-zinc-300 text-sm underline decoration-dotted underline-offset-2 hover:text-white transition-colors text-left"
    >
      {value}
    </button>
  );
}

// --- Inline editable number ---
function EditableNumber({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commit() {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) onChange(n);
    else setDraft(String(value));
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
        className="bg-zinc-800 text-white rounded-lg px-2 py-0.5 text-sm w-24 outline-none focus:ring-1 focus:ring-white/30"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="text-white font-semibold underline decoration-dotted underline-offset-2 hover:text-zinc-300 transition-colors tabular-nums"
    >
      {fmt(value)}
    </button>
  );
}

interface EditData {
  amount: number;
  currency: string;
  category: string;
  entry_date: string;
  note: string;
}

interface EditableExpenseRowProps {
  expense: ExpenseRow;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: EditData) => void;
  onDelete: () => void;
}

function EditableExpenseRow({ expense: e, isEditing, isSaving, onEdit, onCancel, onSave, onDelete }: EditableExpenseRowProps) {
  const [draftAmount, setDraftAmount] = useState(String(e.amount));
  const [draftCurrency, setDraftCurrency] = useState(e.currency);
  const [draftCategory, setDraftCategory] = useState(e.category);
  const [draftDate, setDraftDate] = useState(e.entry_date);
  const [draftNote, setDraftNote] = useState(e.note ?? "");
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setDraftAmount(String(e.amount));
      setDraftCurrency(e.currency);
      setDraftCategory(e.category);
      setDraftDate(e.entry_date);
      setDraftNote(e.note ?? "");
      setTimeout(() => amountRef.current?.focus(), 0);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    const amount = parseFloat(draftAmount);
    if (isNaN(amount) || amount <= 0) return;
    onSave({ amount, currency: draftCurrency, category: draftCategory, entry_date: draftDate, note: draftNote });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") onCancel();
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 py-2 border-b border-zinc-800/60 last:border-0">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={amountRef}
            type="number"
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-zinc-800 text-white rounded-lg px-2 py-1 text-sm w-20 outline-none focus:ring-1 focus:ring-white/30"
          />
          <select
            value={draftCurrency}
            onChange={(e) => setDraftCurrency(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-1.5 py-1 outline-none border-none"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-1.5 py-1 outline-none border-none flex-1 min-w-0"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-zinc-800 text-white rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-white/30 shrink-0"
          />
          <input
            type="text"
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Коммент"
            className="bg-zinc-800 text-white rounded-lg px-2 py-1 text-sm flex-1 min-w-0 outline-none focus:ring-1 focus:ring-white/30 placeholder:text-zinc-600"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-40"
            >
              {isSaving ? "…" : "Сохранить"}
            </button>
            <button
              onClick={onCancel}
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start justify-between py-2 border-b border-zinc-800/60 last:border-0 gap-2">
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
      <div className="flex items-center gap-0.5 shrink-0 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="text-zinc-600 hover:text-zinc-300 text-sm px-1 transition-colors"
          aria-label="Редактировать"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="text-zinc-600 hover:text-red-400 text-base leading-none px-1 transition-colors"
          aria-label="Удалить"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface Props {
  year: number;
  month: number;
  totalSpent: number;
  weekBuckets: WeekBucket[];
  categoryBuckets: CategoryBucket[];
  fxRates: Record<FxCurrency, number>;
  expenses: ExpenseRow[];
}

export default function AnalyticsClient({
  year, month, totalSpent, weekBuckets, categoryBuckets, fxRates, expenses,
}: Props) {
  const router = useRouter();

  const [budget, setBudget] = useState(210600);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(DEFAULT_FIXED);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCurrency, setNewCurrency] = useState<FxCurrency>("RSD");

  const [localExpenses, setLocalExpenses] = useState<ExpenseRow[]>(expenses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Гидратация из localStorage
  useEffect(() => {
    setBudget(readLS(LS_BUDGET, 210600));
    setFixedExpenses(loadFixed());
  }, []);

  // Синхронизация при смене месяца
  useEffect(() => {
    setLocalExpenses(expenses);
    setEditingId(null);
  }, [expenses]);

  function updateFixed(items: FixedExpense[]) {
    setFixedExpenses(items);
    saveFixed(items);
  }

  function updateItem(id: string, patch: Partial<FixedExpense>) {
    updateFixed(fixedExpenses.map((e) => e.id === id ? { ...e, ...patch } : e));
  }

  function deleteItem(id: string) {
    updateFixed(fixedExpenses.filter((e) => e.id !== id));
  }

  function addItem() {
    const amount = parseFloat(newAmount);
    if (!newName.trim() || isNaN(amount) || amount <= 0) return;
    const newItem: FixedExpense = {
      id: Date.now().toString(),
      name: newName.trim(),
      amount,
      currency: newCurrency,
    };
    updateFixed([...fixedExpenses, newItem]);
    setNewName("");
    setNewAmount("");
    setNewCurrency("RSD");
    setShowAddForm(false);
  }

  const fixedTotal = fixedExpenses.reduce((sum, e) => sum + e.amount * (fxRates[e.currency] ?? 1), 0);
  const remaining = budget - fixedTotal;
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyBudget = remaining / daysInMonth;
  const weeklyBudget = dailyBudget * 7;

  const now = new Date();
  const isCurrentOrFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);

  function navigate(delta: number) {
    let m = month + delta, y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    router.push(`/analytics?year=${y}&month=${m}`);
  }

  async function handleSaveEdit(id: string, data: EditData) {
    const token = encodeURIComponent(localStorage.getItem("api_token") ?? "");
    setSavingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}?token=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
      const updated: ExpenseRow = await res.json();
      setLocalExpenses((prev) => prev.map((e) => e.id === id ? updated : e));
      setEditingId(null);
    } catch (err) {
      console.error("handleSaveEdit:", err);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteExpense(id: string) {
    const token = encodeURIComponent(localStorage.getItem("api_token") ?? "");
    const idx = localExpenses.findIndex((e) => e.id === id);
    const removed = localExpenses[idx];
    setLocalExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/expenses/${id}?token=${token}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
    } catch (err) {
      console.error("handleDeleteExpense:", err);
      setLocalExpenses((prev) => [...prev.slice(0, idx), removed, ...prev.slice(idx)]);
    }
  }

  const maxCategory = categoryBuckets[0]?.total ?? 1;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-5 gap-5 pb-10">

      {/* Шапка */}
      <div className="flex items-center justify-between mt-2">
        <a href="/" className="text-zinc-400 text-sm hover:text-white transition-colors">← Назад</a>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors">←</button>
          <span className="text-white font-semibold text-base">{MONTH_NAMES[month - 1]} {year}</span>
          <button onClick={() => navigate(1)} disabled={isCurrentOrFuture} className="text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">→</button>
        </div>
        <div className="w-12" />
      </div>

      {/* Бюджет */}
      <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-zinc-400 text-sm font-medium">Бюджет на месяц</p>
        <div className="flex items-baseline gap-2">
          <EditableNumber
            value={budget}
            onChange={(v) => { setBudget(v); localStorage.setItem(LS_BUDGET, String(v)); }}
          />
          <span className="text-zinc-500 text-sm">RSD</span>
        </div>

        {/* Обязательные расходы */}
        <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Обязательные расходы</p>

          {fixedExpenses.map((item) => {
            const inRsd = item.amount * (fxRates[item.currency] ?? 1);
            return (
              <div key={item.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <EditableText value={item.name} onChange={(v) => updateItem(item.id, { name: v })} />
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <EditableNumber value={item.amount} onChange={(v) => updateItem(item.id, { amount: v })} />
                  <select
                    value={item.currency}
                    onChange={(e) => updateItem(item.id, { currency: e.target.value as FxCurrency })}
                    className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-1.5 py-1 outline-none border-none"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {item.currency !== "RSD" && (
                    <span className="text-zinc-600 text-xs">≈ {fmt(inRsd)} RSD</span>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-base leading-none shrink-0 px-1"
                  aria-label="Удалить"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Форма добавления */}
          {showAddForm ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                autoFocus
                type="text"
                placeholder="Название"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setShowAddForm(false); }}
                className="bg-zinc-800 text-white rounded-lg px-2 py-1 text-sm flex-1 min-w-0 outline-none focus:ring-1 focus:ring-white/30 placeholder:text-zinc-600"
              />
              <input
                type="number"
                placeholder="Сумма"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setShowAddForm(false); }}
                className="bg-zinc-800 text-white rounded-lg px-2 py-1 text-sm w-20 outline-none focus:ring-1 focus:ring-white/30 placeholder:text-zinc-600"
              />
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value as FxCurrency)}
                className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-1.5 py-1.5 outline-none border-none"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addItem} className="text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg px-3 py-1 text-sm transition-colors">+</button>
              <button onClick={() => setShowAddForm(false)} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors text-left pt-1"
            >
              + Добавить расход
            </button>
          )}
        </div>

        {/* Итоги */}
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

      {/* Потрачено за месяц */}
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
                <div key={w.label} className={`flex items-center justify-between rounded-xl px-3 py-2 ${over ? "bg-red-950/40" : "bg-zinc-800/60"}`}>
                  <span className="text-zinc-400 text-sm">{w.label}</span>
                  <span className={`font-semibold text-sm ${over ? "text-red-400" : "text-white"}`}>{fmt(w.total)} RSD</span>
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
                  <div className="h-full bg-white/30 rounded-full" style={{ width: `${(c.total / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Все записи */}
      {localExpenses.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-zinc-400 text-sm font-medium">Все записи</p>
          <div className="flex flex-col">
            {localExpenses.map((e) => (
              <EditableExpenseRow
                key={e.id}
                expense={e}
                isEditing={editingId === e.id}
                isSaving={savingId === e.id}
                onEdit={() => setEditingId(e.id)}
                onCancel={() => setEditingId(null)}
                onSave={(data) => handleSaveEdit(e.id, data)}
                onDelete={() => handleDeleteExpense(e.id)}
              />
            ))}
          </div>
        </div>
      )}

      {localExpenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-zinc-600 text-base">Нет записей за этот месяц</p>
        </div>
      )}
    </div>
  );
}
