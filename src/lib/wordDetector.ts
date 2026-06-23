/**
 * Escape special regex characters so card words can't inject regex syntax.
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize text for comparison (lowercase, unify smart quotes, trim).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

/**
 * Detect which card words appear in a transcript chunk.
 * Multi-word phrases match by substring; single words match on word boundaries.
 * Words already in `alreadyFilled` (lowercased) are skipped.
 */
export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalizedTranscript = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;

    const normalizedWord = normalizeText(word);

    if (normalizedWord.includes(' ')) {
      // Phrases: direct substring match.
      if (normalizedTranscript.includes(normalizedWord)) {
        detected.push(word);
      }
    } else {
      // Single words: word-boundary match.
      const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, 'i');
      if (regex.test(normalizedTranscript)) {
        detected.push(word);
      }
    }
  }

  return detected;
}

/**
 * Common spoken variations mapped to their canonical card word.
 */
export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration'],
  mvp: ['minimum viable product', 'm.v.p.'],
  roi: ['return on investment', 'r.o.i.'],
  api: ['a.p.i.', 'interface'],
  devops: ['dev ops', 'dev-ops'],
};

/**
 * Detection with alias resolution layered on top of `detectWords`.
 */
export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const detected = detectWords(transcript, cardWords, alreadyFilled);
  const normalized = normalizeText(transcript);

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;
    if (detected.includes(word)) continue;

    const aliases = WORD_ALIASES[word.toLowerCase()];
    if (aliases) {
      for (const alias of aliases) {
        if (normalized.includes(alias)) {
          detected.push(word);
          break;
        }
      }
    }
  }

  return detected;
}
