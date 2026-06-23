import { BingoSquare as BingoSquareType } from '../types';
import { cn } from '../lib/utils';

interface Props {
  square: BingoSquareType;
  isWinningSquare: boolean;
  /** Part of the line the player is one square away from completing. */
  isNeeded?: boolean;
  onClick: () => void;
}

export function BingoSquare({ square, isWinningSquare, isNeeded = false, onClick }: Props) {
  const { word, isFilled, isAutoFilled, isFreeSpace } = square;
  const marked = isFilled && !isFreeSpace;

  // Accessible label conveys the state without relying on color.
  const ariaLabel = isFreeSpace
    ? 'Free space, marked'
    : `${word}${isFilled ? ', marked' : ', not marked'}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isFreeSpace}
      aria-pressed={isFreeSpace ? undefined : isFilled}
      aria-label={ariaLabel}
      className={cn(
        'relative aspect-square p-1 sm:p-2 border-2 rounded-lg transition-all duration-200',
        'flex items-center justify-center text-center',
        'text-[10px] sm:text-sm font-medium',
        'hover:scale-105 active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1',
        // Reduced-motion: no transform/animation
        'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
        // Default state
        !isFilled && 'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
        // Filled (manual or auto)
        marked && 'bg-blue-500 border-blue-600 text-white',
        // One-shot fill animation (runs once when the class is first applied; not infinite)
        marked && 'animate-bounce-in motion-reduce:animate-none',
        // Auto-filled squares get a subtle ring so they read as "detected"
        isAutoFilled && !isFreeSpace && 'ring-2 ring-sky-300',
        // Free space
        isFreeSpace && 'bg-amber-100 border-amber-300 text-amber-700 cursor-default',
        // Needed-for-near-win highlight
        isNeeded && !isFilled && 'border-amber-400 ring-2 ring-amber-300',
        // Winning square (takes visual precedence)
        isWinningSquare && 'bg-green-500 border-green-600 text-white ring-2 ring-green-300',
      )}
    >
      {/* Non-color cue: a checkmark on marked squares (WCAG 1.4.1). */}
      {marked && (
        <span aria-hidden="true" className="absolute top-0.5 left-0.5 text-[10px] leading-none">
          ✓
        </span>
      )}
      <span className={cn('break-words leading-tight', marked && 'line-through opacity-90')}>
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </button>
  );
}
