import { generateText, type ModelMessage } from 'ai';
import { Router } from 'express';

import { aiErrorStatus, getChatModel } from '../lib/ai.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { retrieveContext, type MatchedChunk } from '../services/rag.js';

export const chatRouter = Router();

const HISTORY_LIMIT = 10;
const MAX_MESSAGE_LENGTH = 6000;

const SYSTEM_PROMPT = `You are a helpful study assistant. Answer the student's question using the provided context from their study materials.
If the context does not contain the answer, say so honestly and answer from general knowledge only if appropriate.
Be concise and clear.`;

chatRouter.post('/:id/chat', async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.userId!;
  const message =
    typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
    });
  }

  const { data: conversation, error } = await supabaseAdmin
    .from('conversations')
    .select('id, study_set_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error || !conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const { data: studySet, error: studySetError } = await supabaseAdmin
    .from('study_sets')
    .select('id')
    .eq('id', conversation.study_set_id)
    .eq('user_id', userId)
    .single();

  if (studySetError || !studySet) {
    return res.status(404).json({ error: 'Study set not found' });
  }

  const { data: userMessage, error: userMessageError } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    })
    .select('id')
    .single();

  if (userMessageError) {
    throw new Error(userMessageError.message);
  }

  let reply = '';
  let matches: MatchedChunk[] = [];

  try {
    matches = await retrieveContext(conversation.study_set_id, message);
    const context = matches.map((match) => match.content).join('\n\n---\n\n');

    const { data: history, error: historyError } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT);

    if (historyError) {
      throw new Error(`Failed to load chat history: ${historyError.message}`);
    }

    const priorMessages: ModelMessage[] = (history ?? [])
      .reverse()
      .filter(
        (item) => item.role === 'user' || item.role === 'assistant'
      )
      .map((item) => ({
        role: item.role as 'user' | 'assistant',
        content: item.content,
      }));

    const { text } = await generateText({
      model: getChatModel(),
      system: context
        ? `${SYSTEM_PROMPT}\n\nContext:\n${context}`
        : SYSTEM_PROMPT,
      messages: priorMessages,
    });

    reply = text.trim();

    if (!reply) {
      throw new Error('The AI service returned an empty reply.');
    }
  } catch (err) {
    await supabaseAdmin.from('messages').delete().eq('id', userMessage.id);

    const detail =
      err instanceof Error ? err.message : 'Failed to generate chat reply';
    console.error('[chat]', detail);

    const status = aiErrorStatus(err);
    return res.status(status).json({
      error:
        status === 503
          ? detail
          : 'The AI service could not reply. Please try again.',
    });
  }

  const { error: assistantError } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
      metadata: { sources: matches.map((match) => match.id) },
    });

  if (assistantError) {
    await supabaseAdmin.from('messages').delete().eq('id', userMessage.id);
    throw new Error(assistantError.message);
  }

  const { error: updateError } = await supabaseAdmin
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('[chat] failed to update conversation:', updateError.message);
  }

  res.json({
    reply,
    sources: matches.map(({ id, similarity }) => ({ id, similarity })),
  });
});
