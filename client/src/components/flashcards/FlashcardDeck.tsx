'use client';
import { useState } from 'react';
import FlashCard from './FlashCard';
import type { Flashcard } from '@/types';

export default function FlashcardDeck({
  flashcards,
  topicId,
  topicTitle,
}: {
  flashcards: Flashcard[];
  topicId: string;
  topicTitle: string;
}) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setCompleted(prev => new Set([...prev, current]));
    if (current < flashcards.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleFinish = async () => {
    await fetch('/api/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, topicTitle, field: 'flashcardsDone' }),
    });
    alert(`Great job! You reviewed all ${flashcards.length} flashcards.`);
  };

  const card = flashcards[current];
  const progress = Math.round(((completed.size) / flashcards.length) * 100);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Progress bar */}
      <div className="w-full max-w-xl">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{completed.size} reviewed</span>
          <span>{flashcards.length - completed.size} remaining</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <FlashCard
        front={card.attributes.front}
        back={card.attributes.back}
        index={current}
        total={flashcards.length}
      />

      {/* Controls */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        {current === flashcards.length - 1 ? (
          <button
            onClick={handleFinish}
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Finish ✓
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}