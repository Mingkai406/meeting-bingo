import { useEffect, useMemo, useRef } from 'react';
import { GameState, WinningLine } from '../types';
import { checkForBingo, countFilled, getClosestToWin } from '../lib/bingoChecker';
import { BingoCard } from './BingoCard';
import { GameControls } from './GameControls';

interface Props {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  onWin: (winningLine: WinningLine, winningWord: string) => void;
  onNewCard: () => void;
}

export function GameBoard({ game, setGame, onWin, onNewCard }: Props) {
  const card = game.card!;

  // Stale-closure guard: keep the latest card in a ref so any callback (and the
  // speech handler wired in Phase 3) reads current state, never a snapshot.
  const cardRef = useRef(card);
  useEffect(() => {
    cardRef.current = card;
  });

  // word -> {row,col} index. Cards are duplicate-free, so a lookup is unambiguous.
  // Used by manual play and (Phase 3) speech auto-fill.
  const wordIndex = useMemo(() => {
    const index = new Map<string, { row: number; col: number }>();
    for (const row of card.squares) {
      for (const sq of row) {
        if (!sq.isFreeSpace) index.set(sq.word.toLowerCase(), { row: sq.row, col: sq.col });
      }
    }
    return index;
  }, [card]);
  // Currently exercised by tests/Phase 3; referenced here to keep it live.
  void wordIndex;

  const handleSquareClick = (row: number, col: number) => {
    const current = cardRef.current;
    const target = current.squares[row][col];
    if (target.isFreeSpace) return; // free space can't be toggled

    const willFill = !target.isFilled;
    const newSquares = current.squares.map((r) =>
      r.map((s) =>
        s.id === target.id
          ? { ...s, isFilled: willFill, isAutoFilled: false, filledAt: willFill ? Date.now() : null }
          : s,
      ),
    );
    const newCard = { ...current, squares: newSquares };

    setGame((prev) => ({ ...prev, card: newCard, filledCount: countFilled(newCard) }));

    // Win check runs against the freshly computed card, outside the state updater.
    const line = checkForBingo(newCard);
    if (line) onWin(line, target.word);
  };

  const filledWords = countFilled(card) - 1; // exclude the free space
  const closest = getClosestToWin(card);
  const oneAway = closest?.needed === 1;
  const neededSquareIds = oneAway ? new Set(closest!.neededSquares) : undefined;

  return (
    <div className="min-h-screen flex flex-col px-4 py-5 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <span className="font-bold text-gray-800">🎯 Meeting Bingo</span>
        <span className="text-sm font-medium text-gray-600" aria-live="polite">
          {filledWords}/24
        </span>
      </header>

      {oneAway && (
        <div className="mb-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-center py-2 text-sm font-semibold">
          🔥 One away from BINGO! ({closest!.line})
        </div>
      )}

      <BingoCard
        card={card}
        winningLine={game.winningLine}
        neededSquareIds={neededSquareIds}
        onSquareClick={handleSquareClick}
      />

      <GameControls onNewCard={onNewCard} speechSupported={false} />
    </div>
  );
}
