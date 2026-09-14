import { createClient } from '@/utils/supabase/server';

export async function uploadDocument(folderId: string, file: File) {
  const supabase = await createClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `folders/${folderId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return {
    url: data.path,
    fileName: file.name,
  };
}
