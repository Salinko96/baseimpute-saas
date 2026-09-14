import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nif, agreementNo, address, email, phone } = body;

    if (!name || !nif) {
      return NextResponse.json({ error: 'Name and NIF are required' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        nif,
        agreementNo,
        address,
        email,
        phone,
        organizationId: body.organizationId || 'default-org-id',
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A client with this NIF already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
