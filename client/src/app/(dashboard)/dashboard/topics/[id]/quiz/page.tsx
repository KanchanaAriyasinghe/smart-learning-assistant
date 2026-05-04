'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import QuizCard from '@/components/quiz/QuizCard';
import QuizResults from '@/components/quiz/QuizResults';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { strapi } from '@/lib/strapi';
import type { QuizQuestion, Topic } from '@/types';

export default function QuizPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [qRes, tRes] = await Promise.all([
          strapi.getQuizQuestions(params.id),
          strapi.getTopic(params.id),
        ]);
        const qs = qRes.data.data || [];
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(null));
        setTopic(tRes.data.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleSelect = (index: number) => {
    const updated = [...answers];
    updated[current] = index;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: params.id,
        topicTitle: topic?.attributes.title || '',
        answers,
        questions,
      }),
    });
    const data = await response.json();
    setResult({ score: data.score, percentage: data.percentage });
    setSubmitted(true);
  };

  if (loading) return <div className="p-6"><LoadingSpinner text="Loading quiz..." /></div>;
  if (questions.length === 0) return (
    <div className="p-6 text-center">
      <p className="text-gray-500">No quiz questions available for this topic.</p>
    </div>
  );

  if (submitted && result) {
    return (
      <div className="p-6">
        <QuizResults
          score={result.score}
          total={questions.length}
          percentage={result.percentage}
          questions={questions}
          answers={answers}
          topicId={params.id}
        />
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">
        {topic?.attributes.title}
      </h2>
      <QuizCard
        question={q.attributes.question}
        options={q.attributes.options}
        selected={answers[current]}
        onSelect={handleSelect}
        questionNumber={current + 1}
        total={questions.length}
        difficulty={q.attributes.difficulty}
      />
      <div className="flex justify-between mt-6 max-w-2xl mx-auto">
        <button
          onClick={() => setCurrent(c => c - 1)}
          disabled={current === 0}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30"
        >
          ← Previous
        </button>
        {current === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={answers.some(a => a === null)}
            className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
          >
            Submit Quiz ✓
          </button>
        ) : (
          <button
            onClick={() => setCurrent(c => c + 1)}
            disabled={answers[current] === null}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}