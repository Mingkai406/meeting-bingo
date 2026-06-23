import { useState } from 'react';
import { BingoCard, CategoryId, GameState, Screen, WinningLine } from './types';
import { generateCard } from './lib/cardGenerator';
import { countFilled } from './lib/bingoChecker';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

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
  const [screen, setScreen] = useState<Screen>('landing');
  const [game, setGame] = useState<GameState>(INITIAL_GAME);

  const handleStart = () => setScreen('category');

  const handleCategoryStart = (categoryId: CategoryId, card: BingoCard) => {
    setGame(startedGame(categoryId, card));
    setScreen('game');
  };

  const handleNewCard = () => {
    setGame((prev) =>
      prev.category ? startedGame(prev.category, generateCard(prev.category)) : prev,
    );
  };

  const handleWin = (winningLine: WinningLine, winningWord: string) => {
    setGame((prev) => ({
      ...prev,
      status: 'won',
      completedAt: Date.now(),
      winningLine,
      winningWord,
    }));
    setScreen('win');
  };

  const handlePlayAgain = () => {
    if (game.category) {
      setGame(startedGame(game.category, generateCard(game.category)));
      setScreen('game');
    } else {
      setScreen('category');
    }
  };

  const handleHome = () => {
    setGame(INITIAL_GAME);
    setScreen('landing');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
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
