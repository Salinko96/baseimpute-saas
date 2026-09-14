import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateLineTaxes } from '@/services/calculation.service';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;
    const folder = await prisma.importFolder.findUnique({
      where: { id: folderId },
      include: { client: true },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const lines = await prisma.folderLine.findMany({
      where: { folderId },
    });

    const results = [];
    for (const line of lines) {
      try {
        const res = await calculateLineTaxes(folder.clientId, line.id);
        results.push({ lineId: line.id, status: 'success', ...res });
      } catch (e: any) {
        results.push({ lineId: line.id, status: 'error', message: e.message });
      }
    }

    return NextResponse.json({
      folderId,
      results,
      totalProcessed: lines.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
