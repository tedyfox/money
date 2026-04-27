import type { Currency } from "./validate";

// Returns how many RSD equals 1 unit of `currency`
export async function getFxRateToRsd(currency: Currency): Promise<number> {
  if (currency === "RSD") return 1;

  const res = await fetch(
    `https://open.er-api.com/v6/latest/${currency}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
  const data = await res.json() as { rates: Record<string, number> };

  const rate = data.rates?.RSD;
  if (!rate || rate <= 0) throw new Error(`No RSD rate for ${currency}`);
  return rate;
}
