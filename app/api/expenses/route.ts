import { NextRequest, NextResponse } from "next/server";
import { validateExpenseInput } from "@/lib/validate";
import { getFxRateToRsd } from "@/lib/fx";
import { supabase } from "@/lib/db";
import type { Currency } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const now = new Date();
  const year = parseInt(req.nextUrl.searchParams.get("year") ?? String(now.getFullYear()), 10);
  const month = parseInt(req.nextUrl.searchParams.get("month") ?? String(now.getMonth() + 1), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Некорректный год или месяц" }, { status: 400 });
  }

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount_rsd, category, entry_date, amount, currency, note")
    .gte("entry_date", from)
    .lte("entry_date", to)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

const API_TOKEN = process.env.API_TOKEN;

export async function POST(req: NextRequest) {
  // Auth check
  const tokenParam = req.nextUrl.searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!API_TOKEN || (tokenParam !== API_TOKEN && bearerToken !== API_TOKEN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors = validateExpenseInput(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const d = body as { amount: number; currency: Currency; category: string; entry_date: string; note?: string };

  let fxRate: number;
  try {
    fxRate = await getFxRateToRsd(d.currency);
  } catch (e) {
    console.error("FX error:", e);
    return NextResponse.json({ error: "Не удалось получить курс валюты" }, { status: 502 });
  }

  const amountRsd = Math.round(Number(d.amount) * fxRate * 100) / 100;

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      amount: Number(d.amount),
      currency: d.currency,
      category: d.category,
      entry_date: d.entry_date,
      amount_rsd: amountRsd,
      fx_rate_to_rsd: fxRate,
      ...(d.note?.trim() ? { note: d.note.trim() } : {}),
    })
    .select("id, amount_rsd")
    .single();

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
