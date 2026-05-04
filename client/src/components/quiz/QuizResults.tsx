'use client';
import Link from 'next/link';
import type { QuizQuestion } from '@/types';

interface QuizResultsProps {
  score: number;
  total: number;
  percentage: number;
  questions: QuizQuestion[];
  answers: (number | null)[];
  topicId: string;
}

export default function QuizResults({
  score, total, percentage, questions, answers, topicId
}: QuizResultsProps) {
  const grade =
    percentage >= 90 ? '🏆 Excellent!' :
    percentage >= 70 ? '🎉 Good Job!' :
    percentage >= 50 ? '📚 Keep Practicing' :
    '💪 Review the Material';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score Card */}
      <div className="bg-white rounded-2xl border p-8 text-center mb-6">
        <div className="text-5xl mb-2">{grade.split(' ')[0]}</div>
        <h2 className="text-2xl font-bold mb-1">{grade.split(' ').slice(1).join(' ')}</h2>
        <p className="text-gray-500 mb-4">You scored {score} out of {total}</p>
        <div className="text-5xl font-bold text-indigo-600 mb-4">{percentage}%</div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Review Answers */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-lg">Review Answers</h3>
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.attributes.correct_answer;
          return (
            <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">{q.attributes.question}</p>
                  {!isCorrect && answers[i] !== null && (
                    <p className="text-sm text-red-600 mb-1">
                      Your answer: {q.attributes.options[answers[i]!]}
                    </p>
                  )}
                  <p className="text-sm text-green-700 font-medium mb-1">
                    Correct: {q.attributes.options[q.attributes.correct_answer]}
                  </p>
                  {q.attributes.explanation && (
                    <p className="text-sm text-gray-600 italic">
                      {q.attributes.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/topics/${topicId}`} className="flex-1 text-center py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium">
          Back to Topic
        </Link>
        <Link href={`/topics/${topicId}/flashcards`} className="flex-1 text-center py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700">
          Study Flashcards
        </Link>
      </div>
    </div>
  );
}