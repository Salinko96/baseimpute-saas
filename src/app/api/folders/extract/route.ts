import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractInvoiceData } from '@/services/ocr.service';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { folderId, fileUrl } = await request.json();

    if (!folderId || !fileUrl) {
      return NextResponse.json({ error: 'folderId and fileUrl are required' }, { status: 400 });
    }

    // 1. Call the OCR Service
    const ocrResult = await extractInvoiceData(fileUrl);

    // 2. Map OCR results to DB lines
    const createdLines = await prisma.folderLine.createMany({
      data: ocrResult.lines.map(line => ({
        folderId,
        description: line.description,
        shCode: line.shCode,
        cifValue: line.value,
      })),
    });

    return NextResponse.json({
      message: 'Professional extraction completed',
      count: createdLines.count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
