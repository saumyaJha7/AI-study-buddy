# AI Study Buddy

An Expo/React Native study app with Supabase email/password authentication, a
study set library, and account settings.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase project URL and
   publishable key.

3. Apply the database migrations in `supabase/migrations/` to your Supabase
   project, in filename order. Run them from the Supabase Dashboard SQL Editor,
   or link the project and push with the CLI:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   The migrations create the schema, RLS policies, the `profiles` signup
   trigger, and the private `study-materials` storage bucket.

4. Start the app

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
- `supabase/migrations/` — database schema, RLS, and storage setup

## Current scope

- Email/password auth, a persisted study-set library, and PDF uploads to
  Supabase Storage.
- PDF text processing and the AI study modes require the study server and are
  the next phase.

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
