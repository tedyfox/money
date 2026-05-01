import { CATEGORIES } from "@/lib/validate";
import type { Category } from "@/lib/validate";

interface Props {
  selected: Category | "";
  onSelect: (c: Category) => void;
}

export default function CategoryPills({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-[4px]">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`px-[12px] pt-[9px] pb-[10px] rounded-full text-[16px] font-neue font-medium leading-none text-white bg-[#ff6c26] active:opacity-80 transition-opacity ${
            selected === cat ? "border-[3px] border-white" : ""
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
