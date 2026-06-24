import { cn } from '../lib/utils';

interface Props {
  transcript: string;
  interimTranscript: string;
  detectedWords: string[];
  isListening: boolean;
}

export function TranscriptPanel({
  transcript,
  interimTranscript,
  detectedWords,
  isListening,
}: Props) {
  const displayTranscript = transcript.slice(-100); // show only the recent tail

  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            'w-3 h-3 rounded-full',
            isListening ? 'bg-red-500 animate-pulse motion-reduce:animate-none' : 'bg-gray-400',
          )}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-gray-600">
          {isListening ? '🎤 Listening…' : '🎤 Paused'}
        </span>
      </div>

      <div className="text-sm min-h-[40px] mb-2">
        <span className="text-gray-800">{displayTranscript || 'Waiting for speech…'}</span>
        <span className="text-gray-400 italic"> {interimTranscript}</span>
      </div>

      {detectedWords.length > 0 && (
        <div
          className="flex flex-wrap gap-1 pt-2 border-t border-gray-200"
          aria-live="polite"
          aria-label="Detected words"
        >
          <span className="text-xs text-gray-500">Detected:</span>
          {detectedWords.slice(-5).map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
            >
              ✨ {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
