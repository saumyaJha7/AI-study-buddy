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

3. Start the app

   ```bash
   npx expo start
   ```

## Project structure

- `src/app/` — Expo Router routes (`_layout.tsx` files define navigators)
- `src/components/` — reusable UI components
- `src/context/` — auth state provider
- `src/constants/` — theme tokens
- `src/lib/` — Supabase client

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
