import type { NextFunction, Request, Response } from 'express';

import { getUserIdFromToken } from '../lib/supabase.js';

function extractBearerToken(
  header: string | string[] | undefined
): string | null {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const fallback = req.headers['x-access-token'];
  const token =
    extractBearerToken(req.headers.authorization) ??
    (typeof fallback === 'string' ? fallback.trim() : null);

  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const userId = await getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.userId = userId;
  req.accessToken = token;
  next();
}
