import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bulkFlashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      answer: z.string().min(1, 'Answer is required'),
    })
  ).min(1, 'At least one flashcard is required'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studySet = await prisma.studySet.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { flashcards } = bulkFlashcardSchema.parse(body);

    const createdFlashcards = await prisma.flashcard.createMany({
      data: flashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
        studySetId: params.id,
      })),
    });

    return NextResponse.json(
      {
        message: `Successfully created ${createdFlashcards.count} flashcards`,
        count: createdFlashcards.count,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcards' },
      { status: 500 }
    );
  }
}

