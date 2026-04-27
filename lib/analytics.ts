import { supabase } from "./db";

export interface ExpenseRow {
  id: string;
  amount_rsd: number;
  category: string;
  entry_date: string;
  amount: number;
  currency: string;
  note?: string | null;
}

export interface WeekBucket {
  label: string;
  total: number;
  dayFrom: number;
  dayTo: number;
}

export interface CategoryBucket {
  category: string;
  total: number;
}

export async function fetchMonthExpenses(year: number, month: number): Promise<ExpenseRow[]> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount_rsd, category, entry_date, amount, currency, note")
    .gte("entry_date", from)
    .lte("entry_date", to)
    .order("entry_date", { ascending: false });

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return (data ?? []) as ExpenseRow[];
}

// Недели привязаны к месяцу: 1–7, 8–14, 15–21, 22–28, 29–конец
export function groupByMonthWeeks(expenses: ExpenseRow[], year: number, month: number): WeekBucket[] {
  const lastDay = new Date(year, month, 0).getDate();
  const weekRanges: [number, number][] = [];

  for (let start = 1; start <= lastDay; start += 7) {
    weekRanges.push([start, Math.min(start + 6, lastDay)]);
  }

  const monthStr = String(month).padStart(2, "0");
  const yearStr = String(year);

  return weekRanges.map(([from, to]) => {
    const total = expenses
      .filter((e) => {
        const day = parseInt(e.entry_date.slice(8, 10), 10);
        const eMonth = e.entry_date.slice(0, 7);
        return eMonth === `${yearStr}-${monthStr}` && day >= from && day <= to;
      })
      .reduce((sum, e) => sum + Number(e.amount_rsd), 0);

    return {
      label: from === to ? `${from}` : `${from}–${to}`,
      total,
      dayFrom: from,
      dayTo: to,
    };
  });
}

export function groupByCategory(expenses: ExpenseRow[]): CategoryBucket[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount_rsd));
  }
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
