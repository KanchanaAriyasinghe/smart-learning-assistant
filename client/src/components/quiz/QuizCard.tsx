'use client';

interface QuizCardProps {
  question: string;
  options: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  questionNumber: number;
  total: number;
  difficulty: string;
}

const difficultyColor: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function QuizCard({
  question, options, selected, onSelect,
  questionNumber, total, difficulty
}: QuizCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-500">
          Question {questionNumber} / {total}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${difficultyColor[difficulty] || difficultyColor.medium}`}>
          {difficulty}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(questionNumber / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 mb-5 leading-relaxed">
        {question}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
              selected === i
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-700'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold mr-3 ${
              selected === i ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {['A', 'B', 'C', 'D'][i]}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}