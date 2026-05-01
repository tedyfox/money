"use client";

import { useState, useRef, useEffect } from "react";
import { CURRENCIES } from "@/lib/validate";
import type { Currency } from "@/lib/validate";

interface Props {
  amount: string;
  currency: Currency;
  onAmountChange: (v: string) => void;
  onCurrencyChange: (c: Currency) => void;
  showError?: boolean;
  /** Фокус в поле суммы при монтировании и после закрытия выбора валюты */
  autoFocus?: boolean;
}

export default function AmountPill({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  showError,
  autoFocus = false,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus]);

  function closePicker() {
    setShowPicker(false);
    if (!autoFocus) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  return (
    <div className="flex-1 relative">
      {/* Pill — using absolute positioning matching Figma exactly:
          currency at top-32, left-20 (inner area top 15px + mt-17 = 32px)
          amount at top-15, left-84 (inner area top 15px + ml-64 = 84px) */}
      <div
        className="h-[80px] bg-white rounded-full relative"
        style={showError ? { boxShadow: "0 0 0 3px #ff3a34" } : undefined}
      >
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="absolute top-[32px] left-[20px] text-[28px] font-neue font-medium leading-none text-black active:opacity-60"
        >
          {currency}
        </button>
        {/* ⚠️ Figma: нет focus-состояния для ввода */}
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          autoFocus={autoFocus}
          className="absolute top-[15px] bottom-[15px] left-[84px] right-[20px] text-[48px] font-neue font-medium leading-none text-black outline-none bg-transparent placeholder:text-black/30"
        />
      </div>

      {/* Currency picker — fixed bottom sheet, escapes overflow-hidden */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={closePicker}
        >
          <div
            className="w-full bg-white rounded-t-[24px] px-[16px] pt-[16px] pb-[40px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[14px] font-neue font-medium text-black/40 mb-[12px]">Валюта</p>
            <div className="flex gap-[8px] flex-wrap">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onCurrencyChange(c);
                    closePicker();
                  }}
                  className={`px-[20px] py-[12px] rounded-full text-[16px] font-neue font-medium ${
                    c === currency ? "bg-black text-white" : "bg-[#f0f0f0] text-black"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
