import { Router } from 'express';

import { ingestSource } from '../services/ingest.js';

export const sourcesRouter = Router();

sourcesRouter.post('/:id/process', async (req, res) => {
  const result = await ingestSource(req.params.id, req.userId!);
  res.json({ status: 'ready', chunkCount: result.chunkCount });
});
