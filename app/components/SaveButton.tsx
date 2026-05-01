interface Props {
  onPress: () => void;
  loading: boolean;
}

export default function SaveButton({ onPress, loading }: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={loading}
      className="relative flex-1 h-[144px] rounded-[16px] overflow-hidden active:opacity-80 transition-opacity"
    >
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
