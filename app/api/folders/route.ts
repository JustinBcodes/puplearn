import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: {
        children: true,
        studySets: {
          include: {
            _count: {
              select: { flashcards: true },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(folders);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching folders:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

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

    const { name, parentId } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Get the highest position for siblings
    const siblings = await prisma.folder.findMany({
      where: {
        userId: user.id,
        parentId: parentId || null,
      },
      orderBy: { position: 'desc' },
      take: 1,
    });

    const position = siblings.length > 0 ? siblings[0].position + 1 : 0;

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: user.id,
        parentId: parentId || null,
        position,
      },
      include: {
        children: true,
        studySets: {
          include: {
            _count: {
              select: { flashcards: true },
            },
          },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating folder:', error);
    }
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

