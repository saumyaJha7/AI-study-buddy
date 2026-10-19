import pdfParse from 'pdf-parse/lib/pdf-parse.js';

import { supabaseAdmin } from '../lib/supabase.js';

const BUCKET = 'study-materials';

export async function extractPdfText(storagePath: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(
      `Failed to download PDF: ${error?.message ?? 'not found'}`
    );
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const parsed = await pdfParse(buffer);
  return parsed.text;
}
