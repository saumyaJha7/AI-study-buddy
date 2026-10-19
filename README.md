# AI Study Buddy

An Expo/React Native study app with Supabase authentication, PDF study sets,
AI summaries, flashcards, and material-grounded chat.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase project URL,
   publishable key, and `EXPO_PUBLIC_API_URL`. Use `http://localhost:3001` for a
   simulator or your computer's LAN IP for a physical device.

3. Apply the database migrations in `supabase/migrations/` to your Supabase
   project, in filename order. Run them from the Supabase Dashboard SQL Editor,
   or link the project and push with the CLI:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   The migrations create the schema, RLS policies, the `profiles` signup
   trigger, and the private `study-materials` storage bucket.

4. Configure and start the study server

   Copy `server/.env.example` to `server/.env`, then fill in the Supabase URL,
   anon key, service-role key, and `ANTHROPIC_API_KEY`. Keep the service-role key
   server-side only.

   ```bash
   cd server
   npm install
   npm run dev
   ```

   The server extracts and chunks PDF text and provides the summary, flashcard,
   and chat endpoints. `ANTHROPIC_CHAT_MODEL` is optional and defaults to
   `claude-sonnet-4-5`.

5. Start the app

   ```bash
   npx expo start
   ```

## Project structure

- `src/app/` — Expo Router routes (`_layout.tsx` files define navigators)
- `src/components/` — reusable UI components
- `src/context/` — auth state provider
- `src/features/` — data queries and actions grouped by feature
- `src/providers/` — app-wide providers (TanStack Query)
- `src/constants/` — theme tokens
- `src/lib/` — Supabase client, navigation options, API helpers
- `server/` — Express API for PDF processing, AI generation, and chat retrieval
- `supabase/migrations/` — database schema, RLS, and storage setup

## Current scope

- Email/password auth and a persisted study-set library.
- PDF uploads to private Supabase Storage with server-side text extraction and
  chunking.
- AI summaries, flashcard decks, and study chat with keyword retrieval over
  processed source chunks.
- AI output can make mistakes; important details should be checked against the
  original sources.

## Scripts

```bash
npm run start       # start the dev server
npm run android     # start on Android
npm run ios         # start on iOS
npm run web         # start on web
npm run lint        # lint with Expo ESLint config
npm run typecheck   # run TypeScript without emitting
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Supabase with Expo](https://docs.expo.dev/guides/using-supabase/)
