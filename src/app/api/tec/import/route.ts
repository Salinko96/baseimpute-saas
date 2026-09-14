import { NextResponse } from 'next/server';
import { parseTECFile } from '@/services/tec-parser.service';

export async function POST(request: Request) {
  try {
    const { filePath, versionName } = await request.json();

    if (!filePath || !versionName) {
      return NextResponse.json({ error: 'Missing filePath or versionName' }, { status: 400 });
    }

    const result = await parseTECFile(filePath, versionName);

    return NextResponse.json({
      message: 'TEC imported successfully',
      ...result,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
