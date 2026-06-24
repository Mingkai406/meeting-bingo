import { GameState } from '../types';
import { CATEGORIES } from '../data/categories';
import { countFilled } from './bingoChecker';

export type ShareOutcome = 'shared' | 'copied' | 'failed';

function categoryName(game: GameState): string {
  return CATEGORIES.find((c) => c.id === game.category)?.name ?? 'Meeting Bingo';
}

/**
 * Build a shareable one-line summary, e.g.:
 *   "🎯 BINGO in 18 min playing Agile & Scrum! Winning word: 'Blocker' (12 squares). Play: <url>"
 */
export function buildShareText(game: GameState): string {
  const minutes =
    game.startedAt && game.completedAt
      ? Math.max(1, Math.round((game.completedAt - game.startedAt) / 60000))
      : null;
  const time = minutes ? `${minutes} min` : 'record time';
  const word = game.winningWord ?? '—';
  const squares = game.card ? countFilled(game.card) - 1 : 0;
  const url = typeof window !== 'undefined' ? window.location.origin : '';
  return `🎯 BINGO in ${time} playing ${categoryName(game)}! Winning word: '${word}' (${squares} squares). Play: ${url}`;
}

/**
 * Share via the native share sheet (mobile) when available, otherwise copy to
 * the clipboard (desktop). Returns what happened so the UI can show feedback.
 */
export async function shareResult(game: GameState): Promise<ShareOutcome> {
  const text = buildShareText(game);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ text });
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
    return 'failed';
  } catch {
    return 'failed';
  }
}
