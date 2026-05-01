interface Props {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function SaveButton({ onPress, disabled, loading }: Props) {
  return (
    // ⚠️ Figma: нет pressed/disabled состояний — opacity-50 при disabled, spinner при loading
    <button
      type="button"
      onClick={onPress}
      disabled={disabled || loading}
      className="relative flex-1 h-[140px] rounded-[16px] overflow-hidden disabled:opacity-50 active:opacity-80 transition-opacity"
    >
      <img
        src="/save-btn.png"
        alt="Save"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}
