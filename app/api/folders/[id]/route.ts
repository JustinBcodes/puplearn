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

    const folder = await prisma.folder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        children: {
          include: {
            studySets: {
              include: {
                _count: {
                  select: { flashcards: true },
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        studySets: {
          include: {
            _count: {
              select: { flashcards: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        parent: true,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json({ error: 'Failed to fetch folder' }, { status: 500 });
  }
}

export async function PUT(
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

    const { name, parentId, position } = await request.json();

    const folder = await prisma.folder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Prevent circular references
    if (parentId && parentId === params.id) {
      return NextResponse.json({ error: 'Cannot move folder into itself' }, { status: 400 });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(position !== undefined && { position }),
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

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
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

    const folder = await prisma.folder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}

