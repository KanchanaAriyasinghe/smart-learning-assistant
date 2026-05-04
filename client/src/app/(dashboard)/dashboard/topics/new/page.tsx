import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { strapi } from '@/lib/strapi';
import VideoUploadForm from '@/components/topics/VideoUploadForm';
import type { Subject } from '@/types';

export default async function NewTopicPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || '';

  let subjects: Subject[] = [];
  try {
    const res = await strapi.getSubjects(userId);
    subjects = res.data.data || [];
  } catch {}

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add YouTube Video</h1>
        <p className="text-gray-500 mt-1">
          Paste any YouTube lecture or educational video URL and our AI will generate
          a summary, quiz questions, and flashcards automatically.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="font-medium text-amber-800">⚠️ No subjects yet</p>
          <p className="text-sm text-amber-700 mt-1">
            Please create a subject first before adding videos.
          </p>
          <a href="/subjects/new" className="inline-block mt-3 text-sm bg-amber-600 text-white px-4 py-2 rounded-lg">
            Create Subject →
          </a>
        </div>
      ) : (
        <VideoUploadForm subjects={subjects} userId={userId} />
      )}
    </div>
  );
}