import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const learnSession = await prisma.learnSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        learnProgress: {
          include: {
            flashcard: true,
          },
        },
        studySet: true,
      },
    });

    if (!learnSession) {
      return NextResponse.json({ error: 'Learn session not found' }, { status: 404 });
    }

    return NextResponse.json(learnSession);
  } catch (error) {
    console.error('Error fetching learn session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learn session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { progressId, isCorrect, isCompleted } = body;

    const learnSession = await prisma.learnSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!learnSession) {
      return NextResponse.json({ error: 'Learn session not found' }, { status: 404 });
    }

    if (isCompleted !== undefined) {
      const updated = await prisma.learnSession.update({
        where: { id: params.id },
        data: { isCompleted },
        include: {
          learnProgress: {
            include: {
              flashcard: true,
            },
          },
        },
      });
      return NextResponse.json(updated);
    }

    if (progressId && isCorrect !== undefined) {
      const progress = await prisma.learnProgress.findUnique({
        where: { id: progressId },
      });

      if (!progress || progress.sessionId !== params.id) {
        return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
      }

      const masteryGoal = learnSession.masteryGoal;
      
      const updatedProgress = await prisma.learnProgress.update({
        where: { id: progressId },
        data: {
          correctStreak: isCorrect ? progress.correctStreak + 1 : 0,
          totalCorrect: isCorrect ? progress.totalCorrect + 1 : progress.totalCorrect,
          totalIncorrect: isCorrect ? progress.totalIncorrect : progress.totalIncorrect + 1,
          mastered: isCorrect ? progress.correctStreak + 1 >= masteryGoal : false,
          lastSeen: new Date(),
          priority: isCorrect 
            ? Math.max(progress.priority - 20, 10)
            : Math.min(progress.priority + 50, 200),
        },
      });

      const allProgress = await prisma.learnProgress.findMany({
        where: { sessionId: params.id },
      });

      const allMastered = allProgress.every(p => 
        p.id === progressId ? updatedProgress.mastered : p.mastered
      );

      if (allMastered) {
        await prisma.learnSession.update({
          where: { id: params.id },
          data: { isCompleted: true },
        });
      }

      return NextResponse.json(updatedProgress);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating learn session:', error);
    return NextResponse.json(
      { error: 'Failed to update learn session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const learnSession = await prisma.learnSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!learnSession) {
      return NextResponse.json({ error: 'Learn session not found' }, { status: 404 });
    }

    await prisma.learnSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learn session:', error);
    return NextResponse.json(
      { error: 'Failed to delete learn session' },
      { status: 500 }
    );
  }
}

