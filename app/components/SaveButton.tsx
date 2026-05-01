interface Props {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function SaveButton({ onPress, disabled, loading }: Props) {
  return (
    // ⚠️ Figma: нет pressed/disabled/loading состояний
    // h-[144px]: точное соответствие Figma (см. inset расчёт) и aspect ratio картинки (1015×1024)
    <button
      type="button"
      onClick={onPress}
      disabled={disabled || loading}
      className="relative flex-1 h-[144px] rounded-[16px] overflow-hidden disabled:opacity-50 active:opacity-80 transition-opacity"
    >
      {/* object-fill: картинка 1015×1024, почти квадрат — растяжение <0.5%, зато без обрезки */}
      <img
        src="/save-btn.png"
        alt="Save"
        className="absolute inset-0 w-full h-full object-fill"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}
