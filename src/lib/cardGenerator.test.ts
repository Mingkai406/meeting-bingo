import { describe, it, expect } from 'vitest';
import { generateCard, getCardWords } from './cardGenerator';
import { CATEGORIES } from '../data/categories';

describe('categories data', () => {
  it('has exactly 3 categories', () => {
    expect(CATEGORIES).toHaveLength(3);
  });

  it('each category has >= 45 unique words and a sampleWords subset', () => {
    for (const c of CATEGORIES) {
      expect(c.words.length).toBeGreaterThanOrEqual(45);
      expect(new Set(c.words).size).toBe(c.words.length); // no dupes within category
      expect(c.sampleWords.length).toBeGreaterThan(0);
      // every sample word is a real word in the category
      for (const s of c.sampleWords) expect(c.words).toContain(s);
    }
  });

  it('includes multi-word phrases', () => {
    for (const c of CATEGORIES) {
      expect(c.words.some((w) => w.includes(' '))).toBe(true);
    }
  });
});

describe('generateCard', () => {
  it('produces a 5x5 grid', () => {
    const card = generateCard('agile');
    expect(card.squares).toHaveLength(5);
    for (const row of card.squares) expect(row).toHaveLength(5);
  });

  it('has 24 unique words + a center free space', () => {
    const card = generateCard('tech');
    expect(card.words).toHaveLength(24);
    expect(new Set(card.words).size).toBe(24); // no word twice on one card

    const free = card.squares[2][2];
    expect(free.isFreeSpace).toBe(true);
    expect(free.word).toBe('FREE');
    expect(free.isFilled).toBe(true); // free space counts as filled
  });

  it('non-free squares start unfilled', () => {
    const card = generateCard('corporate');
    const nonFree = card.squares.flat().filter((sq) => !sq.isFreeSpace);
    expect(nonFree).toHaveLength(24);
    expect(nonFree.every((sq) => !sq.isFilled && !sq.isAutoFilled)).toBe(true);
  });

  it('regenerating yields a different arrangement', () => {
    const a = generateCard('agile');
    const b = generateCard('agile');
    const seqA = a.squares.flat().map((s) => s.word).join('|');
    const seqB = b.squares.flat().map((s) => s.word).join('|');
    expect(seqA).not.toBe(seqB);
  });

  it('throws on an unknown category', () => {
    // @ts-expect-error testing the runtime guard
    expect(() => generateCard('nope')).toThrow();
  });

  it('getCardWords returns the 24 placed words', () => {
    const card = generateCard('tech');
    expect(getCardWords(card)).toEqual(card.words);
  });
});
