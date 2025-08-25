import { supabase } from '@/integrations/supabase/client';

export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('meal-images')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }

  // Get public URL
  const { data } = supabase.storage
    .from('meal-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('meal-images')
    .getPublicUrl(path);
  
  return data.publicUrl;
}