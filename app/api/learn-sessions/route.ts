import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
    const { studySetId, masteryGoal = 2, flashcardIds } = body;

    const studySet = await prisma.studySet.findFirst({
      where: {
        id: studySetId,
        userId: user.id,
      },
      include: {
        flashcards: true,
      },
    });

    if (!studySet) {
      return NextResponse.json({ error: 'Study set not found' }, { status: 404 });
    }

    if (studySet.flashcards.length === 0) {
      return NextResponse.json({ error: 'Study set has no flashcards' }, { status: 400 });
    }

    const flashcardsToLearn = flashcardIds && flashcardIds.length > 0
      ? studySet.flashcards.filter(card => flashcardIds.includes(card.id))
      : studySet.flashcards;

    if (flashcardsToLearn.length === 0) {
      return NextResponse.json({ error: 'No valid flashcards to learn' }, { status: 400 });
    }

    if (!flashcardIds || flashcardIds.length === 0) {
      const existingSession = await prisma.learnSession.findFirst({
        where: {
          userId: user.id,
          studySetId,
          isCompleted: false,
        },
        include: {
          learnProgress: {
            include: {
              flashcard: true,
            },
          },
        },
      });

      if (existingSession && existingSession.learnProgress.length === studySet.flashcards.length) {
        return NextResponse.json(existingSession);
      }
    }

    const learnSession = await prisma.learnSession.create({
      data: {
        userId: user.id,
        studySetId,
        masteryGoal,
        learnProgress: {
          create: flashcardsToLearn.map(card => ({
            flashcardId: card.id,
            correctStreak: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            mastered: false,
            priority: 100,
          })),
        },
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

    return NextResponse.json(learnSession);
  } catch (error) {
    console.error('Error creating learn session:', error);
    return NextResponse.json(
      { error: 'Failed to create learn session' },
      { status: 500 }
    );
  }
}

