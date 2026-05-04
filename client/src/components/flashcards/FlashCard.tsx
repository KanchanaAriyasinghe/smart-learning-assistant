'use client';
import { useState } from 'react';

interface FlashCardProps {
  front: string;
  back: string;
  index: number;
  total: number;
}

export default function FlashCard({ front, back, index, total }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm text-gray-400 mb-4 font-medium">
        Card {index + 1} of {total}
      </p>
      <div
        className="w-full max-w-xl h-64 cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full h-full transition-all duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white border-2 border-indigo-100 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              Question
            </span>
            <p className="text-xl font-semibold text-center text-gray-800 leading-relaxed">
              {front}
            </p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-4">
              Answer
            </span>
            <p className="text-lg text-center text-white leading-relaxed">{back}</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Click card to flip</p>
    </div>
  );
}