import { GameState } from '../types';
import { countFilled } from '../lib/bingoChecker';
import { cn } from '../lib/utils';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function WinScreen({ game, onPlayAgain, onHome }: Props) {
  const { card, winningLine, winningWord, startedAt, completedAt } = game;
  const winningIds = new Set(winningLine?.squares ?? []);
  const elapsed = startedAt && completedAt ? completedAt - startedAt : 0;
  const filledWords = card ? countFilled(card) - 1 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-900" aria-live="assertive">
        🎉 BINGO!
      </h1>

      {card && (
        <div className="grid grid-cols-5 gap-1 w-full mt-6">
          {card.squares.flat().map((sq) => {
            const isWin = winningIds.has(sq.id);
            return (
              <div
                key={sq.id}
                className={cn(
                  'aspect-square p-1 border rounded flex items-center justify-center text-center text-[9px] sm:text-xs leading-tight break-words',
                  isWin
                    ? 'bg-green-500 border-green-600 text-white'
                    : sq.isFilled
                      ? 'bg-blue-100 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-500',
                )}
              >
                {sq.isFreeSpace ? '⭐' : sq.word}
              </div>
            );
          })}
        </div>
      )}

      <dl className="mt-6 grid grid-cols-3 gap-3 w-full text-center">
        <div>
          <dt className="text-xs text-gray-500">Time</dt>
          <dd className="font-semibold text-gray-900">{formatDuration(elapsed)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Squares</dt>
          <dd className="font-semibold text-gray-900">{filledWords}/24</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Winning word</dt>
          <dd className="font-semibold text-gray-900 break-words">{winningWord ?? '—'}</dd>
        </div>
      </dl>

      <div className="flex gap-3 mt-8 w-full">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 active:scale-95 transition
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold
                     hover:border-blue-300 active:scale-95 transition
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Home
        </button>
      </div>
    </div>
  );
}
