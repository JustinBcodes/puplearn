import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const flashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
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
    const { question, answer } = flashcardSchema.parse(body);

    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        studySetId: params.id,
      },
    });

    return NextResponse.json(flashcard, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}

