import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, WinningLine } from '../types';
import { checkForBingo, countFilled, getClosestToWin } from '../lib/bingoChecker';
import { detectWordsWithAliases } from '../lib/wordDetector';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { BingoCard } from './BingoCard';
import { GameControls } from './GameControls';
import { TranscriptPanel } from './TranscriptPanel';
import { ToastViewport, ToastItem } from './ui/Toast';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  onWin: (winningLine: WinningLine, winningWord: string) => void;
  onNewCard: () => void;
}

export function GameBoard({ game, setGame, onWin, onNewCard }: Props) {
  const card = game.card!;
  const speech = useSpeechRecognition();

  const [micRequested, setMicRequested] = useState(false);
  const [detected, setDetected] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  // Stale-closure guard: callbacks read the latest card / onWin via refs, never a snapshot.
  const cardRef = useRef(card);
  useEffect(() => {
    cardRef.current = card;
  });
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  });

  // Reset transient feedback when a new game/card starts.
  useEffect(() => {
    setDetected([]);
    setToasts([]);
  }, [game.startedAt]);

  // word -> {row,col} index (cards are duplicate-free). Kept for fast lookups.
  const wordIndex = useMemo(() => {
    const index = new Map<string, { row: number; col: number }>();
    for (const row of card.squares) {
      for (const sq of row) {
        if (!sq.isFreeSpace) index.set(sq.word.toLowerCase(), { row: sq.row, col: sq.col });
      }
    }
    return index;
  }, [card]);
  void wordIndex;

  const pushToast = useCallback((msg: string) => {
    const id = (toastIdRef.current += 1);
    setToasts((prev) => [...prev, { id, msg }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  /** Mark a set of squares (manual click or speech auto-fill), then check for a win. */
  const applyFills = useCallback(
    (
      shouldFill: (word: string, isFilled: boolean) => boolean,
      opts: { auto: boolean },
    ): void => {
      const current = cardRef.current;
      let lastWord = '';
      let changed = false;

      const newSquares = current.squares.map((r) =>
        r.map((s) => {
          if (s.isFreeSpace) return s;
          if (shouldFill(s.word, s.isFilled)) {
            changed = true;
            lastWord = s.word;
            // Manual toggles flip the square; auto-fill only ever fills.
            const nextFilled = opts.auto ? true : !s.isFilled;
            return {
              ...s,
              isFilled: nextFilled,
              isAutoFilled: opts.auto,
              filledAt: nextFilled ? Date.now() : null,
            };
          }
          return s;
        }),
      );

      if (!changed) return;
      const newCard = { ...current, squares: newSquares };
      cardRef.current = newCard; // keep ref current for rapid successive speech results
      setGame((prev) => ({ ...prev, card: newCard, filledCount: countFilled(newCard) }));

      const line = checkForBingo(newCard);
      if (line) {
        speech.stopListening();
        onWinRef.current(line, lastWord);
      }
    },
    [setGame, speech],
  );

  const handleSquareClick = (row: number, col: number) => {
    const target = cardRef.current.squares[row][col];
    if (target.isFreeSpace) return;
    applyFills((word) => word === target.word, { auto: false });
  };

  // Speech result handler — reads current card via cardRef (stale-closure-safe).
  const handleResult = useCallback(
    (finalTranscript: string) => {
      const current = cardRef.current;
      const alreadyFilled = new Set(
        current.squares.flat().filter((s) => s.isFilled).map((s) => s.word.toLowerCase()),
      );
      const found = detectWordsWithAliases(finalTranscript, current.words, alreadyFilled);
      if (found.length === 0) return;

      const foundLower = new Set(found.map((w) => w.toLowerCase()));
      applyFills((word, isFilled) => !isFilled && foundLower.has(word.toLowerCase()), {
        auto: true,
      });

      setDetected((prev) => [...prev, ...found].slice(-8));
      for (const w of found) pushToast(`✨ ${w}`);
    },
    [applyFills, pushToast],
  );

  const handleEnableMic = () => {
    setMicRequested(true);
    speech.startListening(handleResult);
  };

  const handleToggleListening = () => {
    if (speech.isListening) speech.stopListening();
    else speech.startListening(handleResult);
  };

  const filledWords = countFilled(card) - 1; // exclude free space
  const closest = getClosestToWin(card);
  const oneAway = closest?.needed === 1;
  const neededSquareIds = oneAway ? new Set(closest!.neededSquares) : undefined;
  const micBlocked = speech.error === 'not-allowed' || speech.error === 'service-not-allowed';

  return (
    <div className="min-h-screen flex flex-col px-4 py-5 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <span className="font-bold text-gray-800">🎯 Meeting Bingo</span>
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          {speech.isListening && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none"
              aria-label="Microphone active"
            />
          )}
          <span aria-live="polite">{filledWords}/24</span>
        </span>
      </header>

      {/* Polite live region: "one away" tension (PRO-31). */}
      <div aria-live="polite">
        {oneAway && (
          <div className="mb-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-center py-2 text-sm font-semibold">
            🔥 One away from BINGO! ({closest!.line})
          </div>
        )}
      </div>

      <BingoCard
        card={card}
        winningLine={game.winningLine}
        neededSquareIds={neededSquareIds}
        onSquareClick={handleSquareClick}
      />

      {/* Speech section */}
      {!speech.isSupported && (
        <p className="mt-4 text-center text-sm text-gray-500">
          🎤 Speech recognition isn’t available in this browser — tap squares to play.
        </p>
      )}

      {speech.isSupported && !micRequested && (
        <Card className="mt-4 text-center">
          <p className="text-sm text-gray-700 font-medium">Enable your microphone to auto-fill squares</p>
          <p className="mt-1 text-xs text-gray-500">
            🔒 Audio is processed on-device and never uploaded. Detection uses your local mic, so it
            works best for in-room meetings or with call audio on speakers. On headphones, tapping
            squares manually is the reliable path.
          </p>
          <Button onClick={handleEnableMic} className="mt-3">
            🎤 Enable microphone
          </Button>
        </Card>
      )}

      {speech.isSupported && micRequested && micBlocked && (
        <p className="mt-4 text-center text-sm text-red-600">
          Microphone access was blocked. You can still tap squares manually.
        </p>
      )}

      {speech.isSupported && micRequested && !micBlocked && (
        <TranscriptPanel
          transcript={speech.transcript}
          interimTranscript={speech.interimTranscript}
          detectedWords={detected}
          isListening={speech.isListening}
        />
      )}

      <GameControls
        onNewCard={onNewCard}
        speechSupported={speech.isSupported && micRequested && !micBlocked}
        isListening={speech.isListening}
        onToggleListening={handleToggleListening}
      />

      {/* Visible toasts; also a polite live region for screen readers (PRO-31). */}
      <ToastViewport toasts={toasts} />
    </div>
  );
}
