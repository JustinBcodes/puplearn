import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const studySessionSchema = z.object({
  studySetId: z.string(),
  totalCards: z.number(),
  correctCards: z.number(),
  wrongCards: z.number(),
  results: z.array(
    z.object({
      flashcardId: z.string(),
      isCorrect: z.boolean(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studySetId, totalCards, correctCards, wrongCards, results } =
      studySessionSchema.parse(body);

    const studySet = await prisma.studySet.findFirst({
      where: {
        id: studySetId,
        userId: session.user.id,
      },
    });

    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }

    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        studySetId,
        totalCards,
        correctCards,
        wrongCards,
        sessionResults: {
          create: results.map((result) => ({
            flashcardId: result.flashcardId,
            isCorrect: result.isCorrect,
          })),
        },
      },
      include: {
        sessionResults: {
          include: {
            flashcard: true,
          },
        },
      },
    });

    return NextResponse.json(studySession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating study session:', error);
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studySetId = searchParams.get('studySetId');

    const where = studySetId
      ? { userId: session.user.id, studySetId }
      : { userId: session.user.id };

    const studySessions = await prisma.studySession.findMany({
      where,
      include: {
        studySet: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(studySessions);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
}

