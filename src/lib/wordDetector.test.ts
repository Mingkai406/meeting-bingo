import { describe, it, expect } from 'vitest';
import { detectWords, detectWordsWithAliases } from './wordDetector';

const NONE = new Set<string>();

describe('detectWords', () => {
  it('detects a single buzzword', () => {
    expect(detectWords('we have a blocker today', ['blocker', 'sprint'], NONE)).toEqual(['blocker']);
  });

  it('detects multi-word phrases as one match', () => {
    const words = ['story points', 'code review'];
    expect(detectWords('assign the story points after code review', words, NONE)).toEqual([
      'story points',
      'code review',
    ]);
  });

  it('is case-insensitive', () => {
    expect(detectWords('SYNERGY and Leverage', ['synergy', 'leverage'], NONE)).toEqual([
      'synergy',
      'leverage',
    ]);
  });

  it('matches single words on word boundaries (no partial hits)', () => {
    // "apiary" must not match "api"
    expect(detectWords('the apiary is busy', ['api'], NONE)).toEqual([]);
    expect(detectWords('call the api now', ['api'], NONE)).toEqual(['api']);
  });

  it('skips words already filled', () => {
    const filled = new Set(['blocker']);
    expect(detectWords('another blocker appeared', ['blocker'], filled)).toEqual([]);
  });

  it('resists regex injection from word data', () => {
    // A word containing regex metachars must be matched literally, not as a pattern.
    expect(detectWords('discuss a/b test results', ['a/b test'], NONE)).toEqual(['a/b test']);
    expect(() => detectWords('x', ['c++ (a|b)'], NONE)).not.toThrow();
  });
});

describe('detectWordsWithAliases', () => {
  it('resolves an alias to the canonical card word', () => {
    expect(
      detectWordsWithAliases('we need continuous integration', ['CI/CD'], NONE),
    ).toEqual(['CI/CD']);
  });

  it('still detects direct matches', () => {
    expect(detectWordsWithAliases('our roi is great', ['ROI'], NONE)).toEqual(['ROI']);
  });

  it('does not double-count a word matched directly and via alias', () => {
    const out = detectWordsWithAliases('minimum viable product, an MVP', ['MVP'], NONE);
    expect(out).toEqual(['MVP']);
  });

  it('respects alreadyFilled for aliases too', () => {
    const filled = new Set(['mvp']);
    expect(detectWordsWithAliases('minimum viable product', ['MVP'], filled)).toEqual([]);
  });
});
