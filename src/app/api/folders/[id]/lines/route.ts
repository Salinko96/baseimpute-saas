import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const lines = await prisma.folderLine.findMany({
      where: { folderId: id },
    });
    return NextResponse.json(lines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
