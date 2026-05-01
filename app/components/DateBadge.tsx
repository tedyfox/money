"use client";

import { useRef } from "react";

const MONTHS_RU = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

interface Props {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export default function DateBadge({ date, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Parse noon to avoid timezone-related day shifts
  const d = new Date(date + "T12:00:00");
  const month = MONTHS_RU[d.getMonth()];
  const day = d.getDate();

  return (
    // ⚠️ Figma: нет tap-состояния — active:opacity-70 добавлен на усмотрение
    <div
      className="relative w-[80px] h-[80px] bg-white rounded-full shrink-0 active:opacity-70 cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <span className="absolute left-[28px] top-[16px] text-[14px] font-neue font-medium leading-none text-[#ff3a34]">
        {month}
      </span>
      <span className="absolute top-[31px] text-[27px] font-neue font-medium leading-none text-black" style={{ left: "calc(50% - 15px)" }}>
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
