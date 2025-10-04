import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const studySetSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  folderId: z.string().optional().nullable(),
  isFavorite: z.boolean().optional(),
  lastAccessed: z.string().optional(),
});

export async function GET(
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
      include: {
        flashcards: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }

    // Update last accessed time
    await prisma.studySet.update({
      where: { id: params.id },
      data: { lastAccessed: new Date() },
    });

    return NextResponse.json(studySet);
  } catch (error) {
    console.error('Error fetching study set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study set' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, folderId, isFavorite } = studySetSchema.parse(body);

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const studySet = await prisma.studySet.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
    });

    if (studySet.count === 0) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Study set updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating study set:', error);
    return NextResponse.json(
      { error: 'Failed to update study set' },
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

    const result = await prisma.studySet.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Study set deleted' });
  } catch (error) {
    console.error('Error deleting study set:', error);
    return NextResponse.json(
      { error: 'Failed to delete study set' },
      { status: 500 }
    );
  }
}

