import { strapi } from '@/lib/strapi';
import FlashcardDeck from '@/components/flashcards/FlashcardDeck';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Topic } from '@/types';

export default async function FlashcardsPage({ params }: { params: { id: string } }) {
  const [flashcardsRes, topicRes] = await Promise.all([
    strapi.getFlashcards(params.id),
    strapi.getTopic(params.id),
  ]);

  const flashcards = flashcardsRes.data.data || [];
  const topic: Topic = topicRes.data.data;

  if (flashcards.length === 0) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-gray-500">No flashcards available for this topic.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-900">{topic.attributes.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{flashcards.length} flashcards</p>
      </div>
      <FlashcardDeck
        flashcards={flashcards}
        topicId={params.id}
        topicTitle={topic.attributes.title}
      />
    </div>
  );
}