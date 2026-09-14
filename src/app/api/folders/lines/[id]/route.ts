import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const oldLine = await prisma.folderLine.findUnique({ where: { id } });

    const updatedLine = await prisma.folderLine.update({
      where: { id },
      data: body,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'UPDATE_LINE',
        entityId: id,
        entityType: 'FolderLine',
        oldValue: oldLine,
        newValue: updatedLine,
      },
    });

    return NextResponse.json(updatedLine);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
