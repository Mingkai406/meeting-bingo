// =============================================
// CATEGORY & WORDS
// =============================================
export type CategoryId = 'agile' | 'corporate' | 'tech';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  /** Full pool the card generator draws from (45+ unique entries). */
  words: string[];
  /** Small preview subset shown on the category card. */
  sampleWords: string[];
}

// =============================================
// BINGO CARD
// =============================================
export interface BingoSquare {
  id: string; // Unique ID: "row-col" e.g., "2-3"
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean; // Filled by speech recognition (vs. manual tap)
  isFreeSpace: boolean;
  /** Epoch ms when filled, or null if unset. Always a number — never a Date. */
  filledAt: number | null;
  row: number;
  col: number;
}

export interface BingoCard {
  squares: BingoSquare[][]; // 5x5 grid
  words: string[]; // Flat list of the 24 placed words, for detection
}

// =============================================
// GAME STATE
// =============================================
export type GameStatus = 'idle' | 'setup' | 'playing' | 'won';

/** Top-level screen the app is showing. */
export type Screen = 'landing' | 'category' | 'game' | 'win';

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal';
  index: number; // 0-4 for row/col, 0-1 for diagonal
  squares: string[]; // IDs of the winning squares (carry row-col coordinates)
}

export interface GameState {
  status: GameStatus;
  category: CategoryId | null;
  card: BingoCard | null;
  isListening: boolean;
  /** Epoch ms. */
  startedAt: number | null;
  /** Epoch ms. */
  completedAt: number | null;
  winningLine: WinningLine | null;
  winningWord: string | null;
  filledCount: number;
}

// =============================================
// SPEECH RECOGNITION
// =============================================
export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

// =============================================
// UI STATE
// =============================================
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  duration?: number;
}
