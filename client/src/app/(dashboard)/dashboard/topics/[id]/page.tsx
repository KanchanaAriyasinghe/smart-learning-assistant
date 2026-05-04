import { strapi } from '@/lib/strapi';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Topic } from '@/types';

export default async function TopicPage({ params }: { params: { id: string } }) {
  let topic: Topic;
  try {
    const { data } = await strapi.getTopic(params.id);
    topic = data.data;
  } catch {
    notFound();
  }

  const attr = topic.attributes;
  const quizCount = attr.quiz_questions?.data?.length || 0;
  const flashcardCount = attr.flashcards?.data?.length || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {attr.subject?.data && (
              <Link href={`/subjects/${attr.subject.data.id}`}
                className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                ← {attr.subject.data.attributes.name}
              </Link>
            )}
            <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${
              attr.status === 'ready' ? 'bg-green-100 text-green-700' :
              attr.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
              attr.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {attr.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{attr.title}</h1>
        </div>
      </div>

      {/* Error state */}
      {attr.status === 'error' && attr.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="font-medium text-red-800">Generation failed</p>
          <p className="text-sm text-red-600 mt-1">{attr.error_message}</p>
        </div>
      )}

      {/* YouTube embed */}
      {attr.youtube_id && (
        <div className="rounded-2xl overflow-hidden mb-6 bg-black">
          <iframe
            width="100%"
            height="380"
            src={getYouTubeEmbedUrl(attr.youtube_id)}
            allowFullScreen
            className="block"
          />
        </div>
      )}

      {/* Action Cards */}
      {attr.status === 'ready' && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href={`/topics/${topic.id}/quiz`}
            className="bg-indigo-600 text-white rounded-xl p-4 hover:bg-indigo-700 transition-colors">
            <div className="text-2xl mb-1">✅</div>
            <div className="font-semibold">Take Quiz</div>
            <div className="text-xs text-indigo-200 mt-0.5">{quizCount} questions</div>
          </Link>
          <Link href={`/topics/${topic.id}/flashcards`}
            className="bg-emerald-600 text-white rounded-xl p-4 hover:bg-emerald-700 transition-colors">
            <div className="text-2xl mb-1">🃏</div>
            <div className="font-semibold">Flashcards</div>
            <div className="text-xs text-emerald-200 mt-0.5">{flashcardCount} cards</div>
          </Link>
          <Link href="/progress"
            className="bg-amber-500 text-white rounded-xl p-4 hover:bg-amber-600 transition-colors">
            <div className="text-2xl mb-1">📊</div>
            <div className="font-semibold">Progress</div>
            <div className="text-xs text-amber-100 mt-0.5">View scores</div>
          </Link>
        </div>
      )}

      {/* Summary */}
      {attr.summary && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📝</span> Summary
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{attr.summary}</p>
        </div>
      )}

      {/* Key Concepts */}
      {attr.key_concepts && attr.key_concepts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <div className="flex flex-wrap gap-2">
            {(attr.key_concepts as string[]).map((concept: string, i: number) => (
              <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}