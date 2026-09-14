import { NextResponse } from 'next/server';
import { uploadDocument } from '@/services/storage.service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;

    if (!file || !folderId) {
      return NextResponse.json({ error: 'File and folderId are required' }, { status: 400 });
    }

    const result = await uploadDocument(folderId, file);

    return NextResponse.json({
      message: 'File uploaded successfully',
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
