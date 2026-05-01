interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function CommentInput({ value, onChange }: Props) {
  return (
    // ⚠️ Figma: нет focus-состояния
    // font-size 16px (вместо 14px из макета) — iOS Safari зумит при font-size < 16px
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Comment"
      maxLength={500}
      className="w-[263px] h-[140px] bg-white rounded-[16px] px-[16px] pt-[16px] pb-[12px] text-[16px] font-neue font-medium leading-[20px] text-black placeholder:text-black/30 outline-none resize-none shrink-0 align-top"
    />
  );
}
