import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Source } from './query';

const BUCKET = 'study-materials';
const MAX_PDF_BYTES = 20 * 1024 * 1024;

export async function pickAndUploadPdf(
  studySetId: string
): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  if (
    !asset.name.toLowerCase().endsWith('.pdf') &&
    asset.mimeType !== 'application/pdf'
  ) {
    throw new Error('Please choose a PDF file.');
  }

  if (typeof asset.size === 'number' && asset.size > MAX_PDF_BYTES) {
    throw new Error('PDFs must be 20 MB or smaller.');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('You need to be signed in to upload a PDF.');

  const title = asset.name.replace(/\.pdf$/i, '').trim() || 'Untitled PDF';
  const storagePath = `${user.id}/${studySetId}/${Date.now()}.pdf`;

  const { data: source, error: insertError } = await supabase
    .from('sources')
    .insert({
      user_id: user.id,
      study_set_id: studySetId,
      type: 'pdf',
      title,
      status: 'pending',
      storage_path: storagePath,
      file_size: asset.size ?? null,
      mime_type: 'application/pdf',
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  if (!source) throw new Error('Could not create the source.');

  try {
    if (Platform.OS === 'web') {
      const file =
        asset.file ?? (await fetch(asset.uri).then((response) => response.blob()));

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;
    } else {
      const { File } = await import('expo-file-system');
      const bytes = await new File(asset.uri).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, bytes, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;
    }

    return source.id as string;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Upload failed';

    await supabase
      .from('sources')
      .update({ status: 'failed', error_message: message })
      .eq('id', source.id);

    throw cause instanceof Error ? cause : new Error(message);
  }
}

export async function deleteSource(source: Source) {
  if (source.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([source.storage_path]);

    if (storageError) throw storageError;
  }

  const { error } = await supabase.from('sources').delete().eq('id', source.id);
  if (error) throw error;
}
