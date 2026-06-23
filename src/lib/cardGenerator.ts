import { BingoCard, BingoSquare, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';

/**
 * Fisher-Yates shuffle (returns a new array; does not mutate the input).
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a randomized 5x5 bingo card for a category.
 * 24 unique words + a pre-filled center FREE space.
 */
export function generateCard(categoryId: CategoryId): BingoCard {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) throw new Error(`Unknown category: ${categoryId}`);

  // Shuffle and take 24 words (the 25th, center, is the free space).
  const selectedWords = shuffle(category.words).slice(0, 24);

  const squares: BingoSquare[][] = [];
  let wordIndex = 0;

  for (let row = 0; row < 5; row++) {
    const rowSquares: BingoSquare[] = [];

    for (let col = 0; col < 5; col++) {
      const isFreeSpace = row === 2 && col === 2;

      rowSquares.push({
        id: `${row}-${col}`,
        word: isFreeSpace ? 'FREE' : selectedWords[wordIndex++],
        isFilled: isFreeSpace, // free space starts filled
        isAutoFilled: false,
        isFreeSpace,
        filledAt: isFreeSpace ? Date.now() : null,
        row,
        col,
      });
    }

    squares.push(rowSquares);
  }

  return {
    squares,
    words: selectedWords, // flat list for efficient detection
  };
}

/**
 * All placed words on the card (excludes the free space).
 */
export function getCardWords(card: BingoCard): string[] {
  return card.words;
}
