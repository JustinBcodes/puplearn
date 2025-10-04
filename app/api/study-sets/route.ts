import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const studySetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  folderId: z.string().optional().nullable(),
  isFavorite: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studySets = await prisma.studySet.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const studySetsWithCount = studySets.map((set) => ({
      ...set,
      flashcardCount: set._count.flashcards,
      _count: undefined,
    }));

    return NextResponse.json(studySetsWithCount);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching study sets:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch study sets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, folderId, isFavorite } = studySetSchema.parse(body);

    const studySet = await prisma.studySet.create({
      data: {
        title,
        description,
        userId: session.user.id,
        folderId: folderId || null,
        isFavorite: isFavorite || false,
      },
    });

    return NextResponse.json(studySet, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating study set:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create study set' },
      { status: 500 }
    );
  }
}

