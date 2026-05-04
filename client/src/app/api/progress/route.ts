import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      quizAttempts: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      topicProgress: {
        orderBy: { updatedAt: 'desc' },
      },
      flashcardProgress: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const avgScore =
    user.quizAttempts.length > 0
      ? Math.round(
          user.quizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
            user.quizAttempts.length
        )
      : 0;

  return NextResponse.json({
    totalTopicsStudied: user.topicProgress.length,
    quizzesTaken: user.quizAttempts.length,
    avgScore,
    flashcardsReviewed: user.flashcardProgress.filter(f => f.status !== 'unseen').length,
    recentAttempts: user.quizAttempts,
    topicProgress: user.topicProgress,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { topicId, topicTitle, field } = await req.json();

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (field === 'summaryViewed') updateData.summaryViewed = true;
  if (field === 'flashcardsDone') updateData.flashcardsDone = true;

  await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId: user.id, topicId } },
    update: { ...updateData, topicTitle: topicTitle || '' },
    create: {
      userId: user.id,
      topicId,
      topicTitle: topicTitle || '',
      ...updateData,
    },
  });

  return NextResponse.json({ success: true });
}