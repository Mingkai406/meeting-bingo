import { useState } from 'react';
import { BingoCard as BingoCardType, Category, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { generateCard } from '../lib/cardGenerator';

interface Props {
  onStart: (categoryId: CategoryId, card: BingoCardType) => void;
  onBack: () => void;
}

export function CategorySelect({ onStart, onBack }: Props) {
  const [selected, setSelected] = useState<Category | null>(null);
  const [preview, setPreview] = useState<BingoCardType | null>(null);

  const pick = (category: Category) => {
    setSelected(category);
    setPreview(generateCard(category.id));
  };

  const regenerate = () => {
    if (selected) setPreview(generateCard(selected.id));
  };

  // ---- Preview step ----
  if (selected && preview) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setPreview(null);
          }}
          className="self-start text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          ← Categories
        </button>

        <h2 className="text-xl font-bold text-gray-900">
          {selected.icon} {selected.name}
        </h2>
        <p className="text-sm text-gray-500 mb-4">Preview your card, then start when you like it.</p>

        <div className="grid grid-cols-5 gap-1 w-full">
          {preview.squares.flat().map((sq) => (
            <div
              key={sq.id}
              className={
                'aspect-square p-1 border rounded flex items-center justify-center text-center text-[9px] sm:text-xs leading-tight break-words ' +
                (sq.isFreeSpace
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-700')
              }
            >
              {sq.isFreeSpace ? '⭐ FREE' : sq.word}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={regenerate}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium
                       hover:border-blue-300 active:scale-95 transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            🔄 Regenerate
          </button>
          <button
            type="button"
            onClick={() => onStart(selected.id, preview)}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold
                       hover:bg-blue-700 active:scale-95 transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // ---- Category list ----
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
        ← Home
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Pick a category</h2>

      <div className="space-y-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => pick(category)}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 bg-white
                       hover:border-blue-300 active:scale-[0.99] transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div className="font-semibold text-gray-900">
              {category.icon} {category.name}
            </div>
            <div className="text-sm text-gray-500">{category.description}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {category.sampleWords.map((w) => (
                <span
                  key={w}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {w}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
