interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center max-w-md mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">🎯 Meeting Bingo</h1>
      <p className="mt-3 text-gray-600">
        Turn buzzword-heavy meetings into a game. Mark squares as you hear them — or let your
        mic do it for you.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg
                   hover:bg-blue-700 active:scale-95 transition
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      >
        New Game
      </button>

      <section className="mt-10 text-left w-full">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">How it works</h2>
        <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
          <li>Pick a buzzword category.</li>
          <li>Get a randomized 5×5 card.</li>
          <li>Tap squares (or enable your mic to auto-fill) as buzzwords come up.</li>
          <li>Complete any line to win!</li>
        </ol>
      </section>

      <p className="mt-8 text-xs text-gray-400">
        🔒 Runs entirely in your browser. Audio never leaves your device — nothing is recorded or
        uploaded.
      </p>
    </div>
  );
}
