import { describe, it, expect } from 'vitest';
import { checkForBingo, countFilled, getClosestToWin } from './bingoChecker';
import { BingoCard, BingoSquare } from '../types';

/** Build a blank 5x5 card with the center free space pre-filled. */
function blankCard(): BingoCard {
  const squares: BingoSquare[][] = [];
  for (let row = 0; row < 5; row++) {
    const r: BingoSquare[] = [];
    for (let col = 0; col < 5; col++) {
      const isFreeSpace = row === 2 && col === 2;
      r.push({
        id: `${row}-${col}`,
        word: isFreeSpace ? 'FREE' : `w-${row}-${col}`,
        isFilled: isFreeSpace,
        isAutoFilled: false,
        isFreeSpace,
        filledAt: isFreeSpace ? 0 : null,
        row,
        col,
      });
    }
    squares.push(r);
  }
  return { squares, words: [] };
}

function fill(card: BingoCard, coords: [number, number][]): BingoCard {
  for (const [row, col] of coords) card.squares[row][col].isFilled = true;
  return card;
}

describe('checkForBingo — all 12 winning lines', () => {
  it('detects each of the 5 rows', () => {
    for (let row = 0; row < 5; row++) {
      const card = fill(blankCard(), [0, 1, 2, 3, 4].map((c) => [row, c] as [number, number]));
      const line = checkForBingo(card);
      expect(line).not.toBeNull();
      expect(line!.type).toBe('row');
      expect(line!.index).toBe(row);
    }
  });

  it('detects each of the 5 columns', () => {
    for (let col = 0; col < 5; col++) {
      const card = fill(blankCard(), [0, 1, 2, 3, 4].map((r) => [r, col] as [number, number]));
      const line = checkForBingo(card);
      expect(line).not.toBeNull();
      expect(line!.type).toBe('column');
      expect(line!.index).toBe(col);
    }
  });

  it('detects both diagonals', () => {
    const d0 = fill(blankCard(), [0, 1, 2, 3, 4].map((i) => [i, i] as [number, number]));
    const l0 = checkForBingo(d0);
    expect(l0!.type).toBe('diagonal');
    expect(l0!.index).toBe(0);

    const d1 = fill(blankCard(), [0, 1, 2, 3, 4].map((i) => [i, 4 - i] as [number, number]));
    const l1 = checkForBingo(d1);
    expect(l1!.type).toBe('diagonal');
    expect(l1!.index).toBe(1);
  });

  it('returns null when there is no completed line', () => {
    expect(checkForBingo(blankCard())).toBeNull();
  });

  it('winning line carries the 5 square IDs', () => {
    const card = fill(blankCard(), [0, 1, 2, 3, 4].map((c) => [0, c] as [number, number]));
    const line = checkForBingo(card)!;
    expect(line.squares).toEqual(['0-0', '0-1', '0-2', '0-3', '0-4']);
  });
});

describe('countFilled', () => {
  it('counts the free space on a blank card', () => {
    expect(countFilled(blankCard())).toBe(1);
  });

  it('counts filled squares including the free space', () => {
    const card = fill(blankCard(), [
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
    expect(countFilled(card)).toBe(4); // 3 filled + free space
  });
});

describe('getClosestToWin', () => {
  it('reports one-away with the missing square', () => {
    // Fill 4 of row 0 (leave 0-4 open).
    const card = fill(blankCard(), [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ]);
    const closest = getClosestToWin(card)!;
    expect(closest.needed).toBe(1);
    expect(closest.line).toBe('Row 1');
    expect(closest.neededSquares).toEqual(['0-4']);
  });

  it('blank card is 4 away via a line through the free center', () => {
    expect(getClosestToWin(blankCard())!.needed).toBe(4);
  });
});
