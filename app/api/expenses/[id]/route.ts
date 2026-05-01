import { NextRequest, NextResponse } from "next/server";
import { validateExpenseUpdate } from "@/lib/validate";
import { getFxRateToRsd } from "@/lib/fx";
import { supabase } from "@/lib/db";
import type { Currency } from "@/lib/validate";

export const dynamic = "force-dynamic";

const API_TOKEN = process.env.API_TOKEN;

function checkAuth(req: NextRequest): boolean {
  const tokenParam = req.nextUrl.searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return !!(API_TOKEN && (tokenParam === API_TOKEN || bearerToken === API_TOKEN));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors = validateExpenseUpdate(body);
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
    .update({
      amount: Number(d.amount),
      currency: d.currency,
      category: d.category,
      entry_date: d.entry_date,
      amount_rsd: amountRsd,
      fx_rate_to_rsd: fxRate,
      note: d.note?.trim() || null,
    })
    .eq("id", id)
    .select("id, amount_rsd, category, entry_date, amount, currency, note")
    .single();

  if (error) {
    console.error("DB error:", error);
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
