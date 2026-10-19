import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';

import { requireAuth } from './middleware/auth.js';
import { chatRouter } from './routes/chat.js';
import { flashcardsRouter } from './routes/flashcards.js';
import { sourcesRouter } from './routes/sources.js';
import { summariesRouter } from './routes/summaries.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

app.use('/sources', requireAuth, sourcesRouter);
app.use('/study-sets', requireAuth, summariesRouter);
app.use('/study-sets', requireAuth, flashcardsRouter);
app.use('/conversations', requireAuth, chatRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const handleError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status =
    typeof error?.status === 'number' &&
    error.status >= 400 &&
    error.status < 600
      ? error.status
      : 500;

  console.error(
    '[api]',
    error instanceof Error ? error.message : 'Request failed'
  );

  res.status(status).json({
    error: error instanceof Error ? error.message : 'Request failed',
  });
};

app.use(handleError);
