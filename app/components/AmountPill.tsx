"use client";

import { CURRENCIES } from "@/lib/validate";
import type { Currency } from "@/lib/validate";

interface Props {
  amount: string;
  currency: Currency;
  onAmountChange: (v: string) => void;
  onCurrencyChange: (c: Currency) => void;
}

export default function AmountPill({ amount, currency, onAmountChange, onCurrencyChange }: Props) {
  function cycleCurrency() {
    const idx = CURRENCIES.indexOf(currency);
    onCurrencyChange(CURRENCIES[(idx + 1) % CURRENCIES.length]);
  }

  return (
    // ⚠️ Figma: нет focus-состояния для ввода и нет экрана выбора валюты — тап по валюте циклически переключает
    <div className="flex-1 h-[80px] bg-white rounded-full px-[20px] flex items-end pb-[15px] gap-[8px] overflow-hidden">
      <button
        type="button"
        onClick={cycleCurrency}
        className="text-[28px] font-neue font-medium leading-none text-black mb-[2px] shrink-0 active:opacity-60"
      >
        {currency}
      </button>
      <input
        autoFocus
        type="number"
        inputMode="decimal"
        placeholder="0"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="flex-1 min-w-0 text-[48px] font-neue font-medium leading-none text-black outline-none bg-transparent placeholder:text-black/30"
      />
    </div>
  );
}
