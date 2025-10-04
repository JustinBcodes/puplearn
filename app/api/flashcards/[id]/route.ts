import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const flashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: params.id },
      include: { studySet: true },
    });

    if (!flashcard || flashcard.studySet.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { question, answer } = flashcardSchema.parse(body);

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: params.id },
      data: { question, answer },
    });

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: params.id },
      include: { studySet: true },
    });

    if (!flashcard || flashcard.studySet.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }

    await prisma.flashcard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Flashcard deleted' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to delete flashcard' },
      { status: 500 }
    );
    }
}

