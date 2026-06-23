import { BingoCard, BingoSquare, WinningLine } from '../types';

/**
 * Check all 12 possible winning lines (5 rows, 5 columns, 2 diagonals).
 * Returns the first winning line found, or null.
 */
export function checkForBingo(card: BingoCard): WinningLine | null {
  const { squares } = card;

  // Rows
  for (let row = 0; row < 5; row++) {
    if (squares[row].every((sq) => sq.isFilled)) {
      return {
        type: 'row',
        index: row,
        squares: squares[row].map((sq) => sq.id),
      };
    }
  }

  // Columns
  for (let col = 0; col < 5; col++) {
    if (squares.every((row) => row[col].isFilled)) {
      return {
        type: 'column',
        index: col,
        squares: squares.map((row) => row[col].id),
      };
    }
  }

  // Diagonal: top-left → bottom-right
  if ([0, 1, 2, 3, 4].every((i) => squares[i][i].isFilled)) {
    return {
      type: 'diagonal',
      index: 0,
      squares: [0, 1, 2, 3, 4].map((i) => `${i}-${i}`),
    };
  }

  // Diagonal: top-right → bottom-left
  if ([0, 1, 2, 3, 4].every((i) => squares[i][4 - i].isFilled)) {
    return {
      type: 'diagonal',
      index: 1,
      squares: [0, 1, 2, 3, 4].map((i) => `${i}-${4 - i}`),
    };
  }

  return null;
}

/**
 * Count filled squares (the free space counts as filled).
 * Single source of truth for `filledCount` — nothing hand-increments.
 */
export function countFilled(card: BingoCard): number {
  return card.squares.flat().filter((sq) => sq.isFilled).length;
}

/** The line closest to completion, with the squares still needed. */
export interface ClosestLine {
  /** How many squares remain to complete this line (1-4). */
  needed: number;
  /** Human-readable line name, e.g. "Row 3" or "Diagonal ↘". */
  line: string;
  /** IDs of the unfilled squares in that line (drives the "one away" highlight). */
  neededSquares: string[];
}

/**
 * Find the incomplete line closest to a bingo, for the "one away" UX.
 * Returns null only when every line is already complete (a fully filled card).
 */
export function getClosestToWin(card: BingoCard): ClosestLine | null {
  const { squares } = card;

  const lines: { squares: BingoSquare[]; name: string }[] = [
    ...squares.map((row, i) => ({ squares: row, name: `Row ${i + 1}` })),
    ...[0, 1, 2, 3, 4].map((col) => ({
      squares: squares.map((row) => row[col]),
      name: `Column ${col + 1}`,
    })),
    { squares: [0, 1, 2, 3, 4].map((i) => squares[i][i]), name: 'Diagonal ↘' },
    { squares: [0, 1, 2, 3, 4].map((i) => squares[i][4 - i]), name: 'Diagonal ↙' },
  ];

  let best: ClosestLine | null = null;

  for (const line of lines) {
    const unfilled = line.squares.filter((sq) => !sq.isFilled);
    const needed = unfilled.length;
    // Skip already-complete lines (needed === 0); track the smallest remaining.
    if (needed > 0 && (best === null || needed < best.needed)) {
      best = {
        needed,
        line: line.name,
        neededSquares: unfilled.map((sq) => sq.id),
      };
    }
  }

  return best;
}
