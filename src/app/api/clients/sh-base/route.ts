import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, shCode, description } = body;

    if (!clientId || !shCode || !description) {
      return NextResponse.json({ error: 'ClientId, SHCode and Description are required' }, { status: 400 });
    }

    const record = await prisma.clientSHBase.create({
      data: {
        clientId,
        shCode,
        description,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This SH code already exists for this client' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'clientId query parameter is required' }, { status: 400 });
  }

  try {
    const shBases = await prisma.clientSHBase.findMany({
      where: { clientId },
      orderBy: { shCode: 'asc' },
    });
    return NextResponse.json(shBases);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
  }

  try {
    await prisma.clientSHBase.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
