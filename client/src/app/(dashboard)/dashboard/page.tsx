import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { strapi } from '@/lib/strapi';
import Link from 'next/link';
import type { Subject } from '@/types';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || '';

  let subjects: Subject[] = [];
  try {
    const res = await strapi.getSubjects(userId);
    subjects = res.data.data || [];
  } catch {}

  const totalTopics = subjects.reduce(
    (acc: number, s: Subject) => acc + (s.attributes.topics?.data?.length || 0), 0
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-0.5">Continue your learning journey</p>
        </div>
        <Link
          href="/topics/new"
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
        >
          + Add YouTube Video
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Subjects', value: subjects.length, icon: '📚' },
          { label: 'Topics', value: totalTopics, icon: '🎬' },
          { label: 'Quizzes Taken', value: '—', icon: '✅' },
          { label: 'Avg Score', value: '—', icon: '🏆' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-8">
        <h2 className="font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/topics/new" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium">
            🎬 Add New Video
          </Link>
          <Link href="/subjects/new" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium">
            📚 Create Subject
          </Link>
          <Link href="/progress" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium">
            📊 View Progress
          </Link>
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Subjects</h2>
          <Link href="/subjects" className="text-sm text-indigo-600 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.slice(0, 6).map((subject: Subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-xl"
                style={{ backgroundColor: subject.attributes.color + '20', color: subject.attributes.color }}
              >
                {subject.attributes.icon || '📚'}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{subject.attributes.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {subject.attributes.topics?.data?.length || 0} topics
              </p>
            </Link>
          ))}
          <Link
            href="/subjects/new"
            className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
          >
            <span className="text-2xl mb-1">+</span>
            <span className="text-sm">New Subject</span>
          </Link>
        </div>
      </div>
    </div>
  );
}