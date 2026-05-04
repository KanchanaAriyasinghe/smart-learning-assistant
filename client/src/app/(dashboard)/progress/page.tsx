import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || '';

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      quizAttempts: { orderBy: { createdAt: 'desc' }, take: 15 },
      topicProgress: { orderBy: { updatedAt: 'desc' } },
    },
  });

  const avgScore = user?.quizAttempts.length
    ? Math.round(user.quizAttempts.reduce((s, a) => s + a.percentage, 0) / user.quizAttempts.length)
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Topics Studied', value: user?.topicProgress.length || 0, icon: '📚' },
          { label: 'Quizzes Taken', value: user?.quizAttempts.length || 0, icon: '✅' },
          { label: 'Average Score', value: `${avgScore}%`, icon: '🏆' },
          {
            label: 'Completion Rate',
            value: user?.topicProgress.length
              ? Math.round(user.topicProgress.filter(t => t.quizCompleted).length / user.topicProgress.length * 100) + '%'
              : '0%',
            icon: '📊'
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Quiz Attempts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Quiz Attempts</h2>
        {!user?.quizAttempts.length ? (
          <p className="text-gray-400 text-sm">No quizzes taken yet</p>
        ) : (
          <div className="space-y-3">
            {user.quizAttempts.map(attempt => (
              <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{attempt.topicTitle || 'Topic'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    attempt.percentage >= 70 ? 'text-green-600' :
                    attempt.percentage >= 50 ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    {Math.round(attempt.percentage)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {attempt.score}/{attempt.totalQ} correct
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Topics Progress</h2>
        {!user?.topicProgress.length ? (
          <p className="text-gray-400 text-sm">No topics studied yet</p>
        ) : (
          <div className="space-y-4">
            {user.topicProgress.map(tp => (
              <div key={tp.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800">{tp.topicTitle || 'Topic'}</span>
                  <span className="text-gray-500">{Math.round(tp.completionPct)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${tp.completionPct}%` }}
                  />
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className={tp.summaryViewed ? 'text-green-600' : ''}>
                    {tp.summaryViewed ? '✓' : '○'} Summary
                  </span>
                  <span className={tp.quizCompleted ? 'text-green-600' : ''}>
                    {tp.quizCompleted ? '✓' : '○'} Quiz
                  </span>
                  <span className={tp.flashcardsDone ? 'text-green-600' : ''}>
                    {tp.flashcardsDone ? '✓' : '○'} Flashcards
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}