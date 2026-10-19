import { generateText } from 'ai';
import { Router } from 'express';

import { chatModelId, getChatModel } from '../lib/ai.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getStudySetText } from '../services/rag.js';

export const summariesRouter = Router();

const PROMPT_VERSION = 'summary-v1';

const SYSTEM_PROMPT = `You are a study assistant. Write a clear, well-structured study summary of the provided material in Markdown.
Use headings, short paragraphs, and bullet points for key concepts. Focus on what a student needs to understand and remember.`;

summariesRouter.post('/:id/summary', async (req, res) => {
  const studySetId = req.params.id;
  const userId = req.userId!;

  const { data: studySet, error } = await supabaseAdmin
    .from('study_sets')
    .select('id')
    .eq('id', studySetId)
    .eq('user_id', userId)
    .single();

  if (error || !studySet) {
    return res.status(404).json({ error: 'Study set not found' });
  }

  const material = await getStudySetText(studySetId);
  if (!material) {
    return res
      .status(422)
      .json({ error: 'No processed sources to summarize yet' });
  }

  let text: string;

  try {
    const result = await generateText({
      model: getChatModel(),
      system: SYSTEM_PROMPT,
      prompt: material,
    });
    text = result.text.trim();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate a summary';
    console.error('[summaries]', message);

    const status =
      (err as { status?: number })?.status === 503 ? 503 : 502;

    return res.status(status).json({
      error:
        status === 503
          ? message
          : 'The AI service could not generate a summary. Please try again.',
    });
  }

  if (!text) {
    return res
      .status(502)
      .json({ error: 'The AI service returned an empty summary.' });
  }

  const { data: summary, error: insertError } = await supabaseAdmin
    .from('summaries')
    .insert({
      user_id: userId,
      study_set_id: studySetId,
      content: text,
      model: chatModelId,
      prompt_version: PROMPT_VERSION,
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  res.json({ id: summary.id, content: text });
});
