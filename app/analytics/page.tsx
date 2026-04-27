import { fetchMonthExpenses, groupByMonthWeeks, groupByCategory } from "@/lib/analytics";
import { getFxRateToRsd } from "@/lib/fx";
import AnalyticsClient from "./AnalyticsClient";

export const revalidate = 0;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear();
  const month = sp.month ? parseInt(sp.month, 10) : now.getMonth() + 1;

  const [expenses, eurRate, rubRate, usdRate, gelRate] = await Promise.all([
    fetchMonthExpenses(year, month),
    getFxRateToRsd("EUR"),
    getFxRateToRsd("RUB"),
    getFxRateToRsd("USD"),
    getFxRateToRsd("GEL"),
  ]);

  const weekBuckets = groupByMonthWeeks(expenses, year, month);
  const categoryBuckets = groupByCategory(expenses);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount_rsd), 0);

  return (
    <AnalyticsClient
      year={year}
      month={month}
      totalSpent={totalSpent}
      weekBuckets={weekBuckets}
      categoryBuckets={categoryBuckets}
      fxRates={{ EUR: eurRate, RUB: rubRate, USD: usdRate, GEL: gelRate, RSD: 1 }}
      expenses={expenses}
    />
  );
}
