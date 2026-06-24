import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface Props {
  onNewCard: () => void;
  /** Whether speech recognition is available (false until Phase 3 wires it). */
  speechSupported?: boolean;
  isListening?: boolean;
  onToggleListening?: () => void;
}

export function GameControls({
  onNewCard,
  speechSupported = false,
  isListening = false,
  onToggleListening,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      <Button onClick={onNewCard} variant="secondary">
        🔄 New Card
      </Button>

      {/* Listening toggle — visible only when speech is supported (final wiring in Phase 3). */}
      {speechSupported && (
        <button
          type="button"
          onClick={onToggleListening}
          aria-pressed={isListening}
          className={cn(
            'px-4 py-2 rounded-lg border-2 font-medium active:scale-95 transition',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
            isListening
              ? 'bg-red-500 border-red-600 text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300',
          )}
        >
          {isListening ? '⏸ Stop listening' : '🎤 Start listening'}
        </button>
      )}
    </div>
  );
}
