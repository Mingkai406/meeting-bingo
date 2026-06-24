export interface ToastItem {
  id: number;
  msg: string;
}

/**
 * Fixed, non-blocking toast stack. Also a polite live region so screen-reader
 * users hear detected words / status (PRO-31). Toast lifetimes are managed by
 * the caller (push + auto-dismiss).
 */
export function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-full bg-green-600 text-white text-sm px-4 py-1.5 shadow-lg animate-bounce-in motion-reduce:animate-none"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
