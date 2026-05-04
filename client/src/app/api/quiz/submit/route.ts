import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { topicId, topicTitle, answers, questions } = await req.json();

  // Calculate score
  let correct = 0;
  (questions as any[]).forEach((q: any, i: number) => {
    if (answers[i] === q.attributes.correct_answer) correct++;
  });
  const percentage = Math.round((correct / questions.length) * 100);

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Save quiz attempt
  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      topicId,
      topicTitle: topicTitle || 'Unknown Topic',
      score: correct,
      totalQ: questions.length,
      percentage,
      answers,
    },
  });

  // Update/create topic progress
  await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId: user.id, topicId } },
    update: {
      quizCompleted: true,
      bestScore: Math.max(percentage, 0),
      completionPct: Math.min(100, percentage),
      topicTitle: topicTitle || '',
    },
    create: {
      userId: user.id,
      topicId,
      topicTitle: topicTitle || '',
      quizCompleted: true,
      bestScore: percentage,
      completionPct: percentage,
    },
  });

  return NextResponse.json({
    success: true,
    score: correct,
    total: questions.length,
    percentage,
  });
}