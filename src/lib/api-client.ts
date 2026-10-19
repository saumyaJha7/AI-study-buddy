import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function apiPost<T>(path: string, body: unknown = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not set.');
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  let response: Response;

  try {
    response = await fetch(`${API_URL.replace(/\/+$/, '')}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Cannot reach the study server at ${API_URL}. Check that it is running and your device can reach this address.`
    );
  }

  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed (${response.status}). Please try again.`;

    try {
      const parsed: unknown = JSON.parse(text);
      if (
        parsed &&
        typeof parsed === 'object' &&
        'error' in parsed &&
        typeof parsed.error === 'string'
      ) {
        message = parsed.error;
      }
    } catch {
      // Proxies and missing routes may return HTML instead of JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function processSource(sourceId: string) {
  return apiPost<{ status: string; chunkCount: number }>(
    `/sources/${sourceId}/process`
  );
}

export function generateSummary(studySetId: string) {
  return apiPost<{ id: string; content: string }>(
    `/study-sets/${studySetId}/summary`
  );
}
