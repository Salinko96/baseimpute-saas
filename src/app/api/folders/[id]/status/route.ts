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

    if (!body.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const folder = await prisma.importFolder.update({
      where: { id },
      data: { status: body.status },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'UPDATE_STATUS',
        entityId: id,
        entityType: 'ImportFolder',
        newValue: { status: body.status },
      },
    });

    return NextResponse.json(folder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
