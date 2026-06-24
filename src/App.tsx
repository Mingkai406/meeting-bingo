import { Dispatch, SetStateAction, useCallback } from 'react';
import { BingoCard, CategoryId, GameState, Screen, WinningLine } from './types';
import { generateCard } from './lib/cardGenerator';
import { countFilled } from './lib/bingoChecker';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

const STORAGE_KEY = 'meeting-bingo:state';

const INITIAL_GAME: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

interface Persisted {
  screen: Screen;
  game: GameState;
}

/** Build a fresh "playing" game from a category + card. filledCount is derived. */
function startedGame(categoryId: CategoryId, card: BingoCard): GameState {
  return {
    status: 'playing',
    category: categoryId,
    card,
    isListening: false,
    startedAt: Date.now(),
    completedAt: null,
    winningLine: null,
    winningWord: null,
    filledCount: countFilled(card),
  };
}

export default function App() {
  const [persisted, setPersisted] = useLocalStorage<Persisted>(
    STORAGE_KEY,
    { screen: 'landing', game: INITIAL_GAME },
    {
      // Only resume an in-progress game; never auto-resume listening (mic can't auto-resume).
      parse: (raw) => {
        if (raw?.screen === 'game' && raw.game?.card && raw.game.status === 'playing') {
          return { screen: 'game', game: { ...raw.game, isListening: false } };
        }
        return { screen: 'landing', game: INITIAL_GAME };
      },
    },
  );

  const { screen, game } = persisted;

  const setScreen = useCallback(
    (s: Screen) => setPersisted((p) => ({ ...p, screen: s })),
    [setPersisted],
  );

  const setGame = useCallback<Dispatch<SetStateAction<GameState>>>(
    (action) =>
      setPersisted((p) => ({
        ...p,
        game: typeof action === 'function' ? (action as (g: GameState) => GameState)(p.game) : action,
      })),
    [setPersisted],
  );

  const handleStart = () => setScreen('category');

  const handleCategoryStart = (categoryId: CategoryId, card: BingoCard) =>
    setPersisted({ screen: 'game', game: startedGame(categoryId, card) });

  const handleNewCard = () =>
    setGame((prev) =>
      prev.category ? startedGame(prev.category, generateCard(prev.category)) : prev,
    );

  const handleWin = (winningLine: WinningLine, winningWord: string) =>
    setPersisted((p) => ({
      screen: 'win',
      game: { ...p.game, status: 'won', completedAt: Date.now(), winningLine, winningWord },
    }));

  const handlePlayAgain = () => {
    if (game.category) {
      setPersisted({ screen: 'game', game: startedGame(game.category, generateCard(game.category)) });
    } else {
      setScreen('category');
    }
  };

  const handleHome = () => setPersisted({ screen: 'landing', game: INITIAL_GAME });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      {screen === 'landing' && <LandingPage onStart={handleStart} />}

      {screen === 'category' && (
        <CategorySelect onStart={handleCategoryStart} onBack={handleHome} />
      )}

      {screen === 'game' && game.card && (
        <GameBoard game={game} setGame={setGame} onWin={handleWin} onNewCard={handleNewCard} />
      )}

      {screen === 'win' && (
        <WinScreen game={game} onPlayAgain={handlePlayAgain} onHome={handleHome} />
      )}
    </div>
  );
}
