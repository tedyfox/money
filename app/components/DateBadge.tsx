"use client";

import { useRef } from "react";

const MONTHS_RU = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

interface Props {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export default function DateBadge({ date, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const d = new Date(date + "T12:00:00");
  const month = MONTHS_RU[d.getMonth()];
  const day = d.getDate();

  return (
    // ⚠️ Figma: нет tap-состояния
    <div
      className="relative w-[80px] h-[80px] bg-white rounded-full shrink-0 active:opacity-70 cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <span className="absolute left-[28px] top-[16px] text-[14px] font-neue font-medium leading-none text-[#ff3a34]">
        {month}
      </span>
      {/* inset-x-0 + text-center centers the day number regardless of digit count */}
      <span className="absolute inset-x-0 top-[31px] text-[27px] font-neue font-medium leading-none text-black text-center">
        {day}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={date}
        onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabIndex={-1}
      />
    </div>
  );
}
