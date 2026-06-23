import { useEffect, useState } from 'react';
import { GameState } from '../types';
import { countFilled } from '../lib/bingoChecker';
import { fireConfetti } from '../lib/confetti';
import { shareResult } from '../lib/shareUtils';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

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

  const [shareLabel, setShareLabel] = useState('Share');

  useEffect(() => {
    fireConfetti(); // silent; auto-skips under prefers-reduced-motion
  }, []);

  const handleShare = async () => {
    const outcome = await shareResult(game);
    setShareLabel(outcome === 'copied' ? 'Copied!' : outcome === 'shared' ? 'Shared!' : 'Try again');
    window.setTimeout(() => setShareLabel('Share'), 2000);
  };

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

      <Button onClick={handleShare} variant="secondary" className="mt-6 w-full">
        🔗 {shareLabel}
      </Button>

      <div className="flex gap-3 mt-3 w-full">
        <Button onClick={onPlayAgain} className="flex-1 py-3">
          Play Again
        </Button>
        <Button onClick={onHome} variant="secondary" className="flex-1 py-3">
          Home
        </Button>
      </div>
    </div>
  );
}
