import { generateText } from 'ai';
import { Router } from 'express';
import { z } from 'zod';

import { getChatModel } from '../lib/ai.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getStudySetText } from '../services/rag.js';

export const flashcardsRouter = Router();

const DEFAULT_COUNT = 12;
const MIN_COUNT = 1;
const MAX_COUNT = 20;

const flashcardsSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string().trim().min(1),
        back: z.string().trim().min(1),
      })
    )
    .min(1)
    .max(MAX_COUNT),
});

function systemPrompt(count: number) {
  return `You are a study assistant. Generate exactly ${count} concise, high-quality flashcards from the provided material.
Return ONLY valid JSON matching this shape (no markdown fences, no commentary):
{"cards":[{"front":"question or term","back":"answer or definition"}]}`;
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error('Model did not return valid JSON for flashcards');
  }
}

function requestedCount(body: unknown): number {
  const raw =
    typeof body === 'object' && body !== null && 'count' in body
      ? (body as { count: unknown }).count
      : undefined;

  const value =
    typeof raw === 'number' && Number.isFinite(raw)
      ? Math.floor(raw)
      : DEFAULT_COUNT;

  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, value));
}

function aiErrorStatus(err: unknown): number {
  return (err as { status?: number })?.status === 503 ? 503 : 502;
}

flashcardsRouter.post('/:id/flashcards', async (req, res) => {
  const studySetId = req.params.id;
  const userId = req.userId!;

  const { data: studySet, error } = await supabaseAdmin
    .from('study_sets')
    .select('id, title')
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
      .json({ error: 'No processed sources to generate flashcards from yet' });
  }

  const count = requestedCount(req.body);
  let rawResponse: string;

  try {
    const result = await generateText({
      model: getChatModel(),
      system: systemPrompt(count),
      prompt: material,
      temperature: 0.4,
    });
    rawResponse = result.text.trim();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate flashcards';
    console.error('[flashcards]', message);

    const status = aiErrorStatus(err);
    return res.status(status).json({
      error:
        status === 503
          ? message
          : 'The AI service could not generate flashcards. Please try again.',
    });
  }

  let cards: { front: string; back: string }[];

  try {
    const parsed = flashcardsSchema.parse(extractJsonObject(rawResponse));
    cards = parsed.cards.slice(0, count);
  } catch (err) {
    console.error(
      '[flashcards] invalid model response:',
      err instanceof Error ? err.message : 'unknown error'
    );
    return res.status(502).json({
      error: 'The AI service returned invalid flashcards. Please try again.',
    });
  }

  if (!cards.length) {
    return res
      .status(502)
      .json({ error: 'The AI service returned no flashcards.' });
  }

  const { data: deck, error: deckError } = await supabaseAdmin
    .from('flashcard_decks')
    .insert({
      user_id: userId,
      study_set_id: studySetId,
      title: `${studySet.title} Flashcards`,
    })
    .select('id')
    .single();

  if (deckError) {
    throw new Error(deckError.message);
  }

  const rows = cards.map((card, index) => ({
    deck_id: deck.id,
    front: card.front,
    back: card.back,
    sort_order: index,
  }));

  const { error: cardsError } = await supabaseAdmin
    .from('flashcards')
    .insert(rows);

  if (cardsError) {
    await supabaseAdmin
      .from('flashcard_decks')
      .delete()
      .eq('id', deck.id);
    throw new Error(cardsError.message);
  }

  res.json({ deckId: deck.id, cards });
});
