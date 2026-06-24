import { useCallback, useEffect, useRef, useState } from 'react';
import { SpeechRecognitionState } from '../types';

// Minimal Web Speech API typings (no DOM lib types ship for this).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionCtor: any =
  typeof window !== 'undefined'
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

/** Keep stored transcript bounded so a long meeting can't grow it without limit. */
const MAX_TRANSCRIPT_CHARS = 500;
/** An `onend` sooner than this after start counts as a "quick end" (likely failure). */
const QUICK_END_MS = 1000;
/** After this many consecutive quick ends, stop trying (avoids restart loops, esp. iOS). */
const MAX_QUICK_ENDS = 5;

export interface UseSpeechRecognition extends SpeechRecognitionState {
  startListening: (onResult?: (transcript: string) => void) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognition {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SpeechRecognitionCtor,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<((transcript: string) => void) | null>(null);

  // Auto-restart bookkeeping — all in refs so onend never reads/writes via setState.
  const intendedRef = useRef(false);
  const lastStartRef = useRef(0);
  const quickEndsRef = useRef(0);
  const restartTimerRef = useRef<number | null>(null);

  const clearRestartTimer = () => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  // start() is only ever called here — never inside a setState updater.
  const safeStart = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
      lastStartRef.current = Date.now();
    } catch {
      // already started — ignore
    }
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }

      setState((prev) => ({
        ...prev,
        transcript: (prev.transcript + final).slice(-MAX_TRANSCRIPT_CHARS),
        interimTranscript: interim,
      }));

      if (final && onResultRef.current) onResultRef.current(final);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      // A permission denial is terminal — stop intending to listen.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        intendedRef.current = false;
      }
      setState((prev) => ({ ...prev, error: event.error }));
    };

    recognition.onend = () => {
      if (!intendedRef.current) {
        setState((prev) => ({ ...prev, isListening: false }));
        return;
      }

      // Track rapid ends; back off and eventually give up to avoid a restart loop.
      const elapsed = Date.now() - lastStartRef.current;
      quickEndsRef.current = elapsed < QUICK_END_MS ? quickEndsRef.current + 1 : 0;

      if (quickEndsRef.current >= MAX_QUICK_ENDS) {
        intendedRef.current = false;
        setState((prev) => ({ ...prev, isListening: false, error: 'restart-failed' }));
        return;
      }

      const delay = Math.min(quickEndsRef.current * 300, 2000);
      restartTimerRef.current = window.setTimeout(safeStart, delay);
    };

    recognitionRef.current = recognition;

    return () => {
      intendedRef.current = false;
      clearRestartTimer();
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [safeStart]);

  const startListening = useCallback(
    (onResult?: (transcript: string) => void) => {
      if (!recognitionRef.current) return;
      onResultRef.current = onResult ?? null;
      intendedRef.current = true;
      quickEndsRef.current = 0;
      clearRestartTimer();
      setState((prev) => ({
        ...prev,
        isListening: true,
        transcript: '',
        interimTranscript: '',
        error: null,
      }));
      safeStart();
    },
    [safeStart],
  );

  const stopListening = useCallback(() => {
    intendedRef.current = false;
    clearRestartTimer();
    onResultRef.current = null;
    setState((prev) => ({ ...prev, isListening: false }));
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
