import { BingoCard as BingoCardType, WinningLine } from '../types';
import { BingoSquare } from './BingoSquare';

interface Props {
  card: BingoCardType;
  winningLine: WinningLine | null;
  /** Square IDs to highlight when the player is one away from a bingo. */
  neededSquareIds?: Set<string>;
  onSquareClick: (row: number, col: number) => void;
}

export function BingoCard({ card, winningLine, neededSquareIds, onSquareClick }: Props) {
  const winningIds = new Set(winningLine?.squares ?? []);

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-md mx-auto" role="grid" aria-label="Bingo card">
      {card.squares.flat().map((square) => (
        <BingoSquare
          key={square.id}
          square={square}
          isWinningSquare={winningIds.has(square.id)}
          isNeeded={neededSquareIds?.has(square.id) ?? false}
          onClick={() => onSquareClick(square.row, square.col)}
        />
      ))}
    </div>
  );
}
