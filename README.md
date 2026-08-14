[![CI](https://github.com/rodrigogerman16/nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/rodrigogerman16/nexus/actions/workflows/ci.yml)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploying NEXUS to Vercel

1. **Import the repo.** At [vercel.com/new](https://vercel.com/new), import `rodrigogerman16/nexus` from GitHub. Vercel auto-detects Next.js — no build config needed.

2. **Set environment variables.** In the project's Settings → Environment Variables, add the same variables from `.env.local.example`:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | From your Supabase project's API settings |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Same place |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes | Same place — keep this one server-only, never `NEXT_PUBLIC_` |
   | `NEXT_PUBLIC_AI_PROVIDER` | Yes | `mock` (free, default) or `anthropic` (real Claude responses) |
   | `ANTHROPIC_API_KEY` | Only if `AI_PROVIDER=anthropic` | From [platform.claude.com](https://platform.claude.com) → Settings → API Keys |
   | `ANTHROPIC_MODEL` | No | Defaults to `claude-haiku-4-5` if unset |

3. **Deploy.** Vercel builds and deploys automatically; every push to `main` redeploys.

4. **Update Supabase's Auth URL settings.** In your Supabase project → Authentication → URL Configuration, set **Site URL** to your production Vercel URL (e.g. `https://nexus-yourname.vercel.app`), and add it to **Redirect URLs**. Without this, the confirmation-email link sent on signup will point at `localhost` instead of your live site.

CI (`.github/workflows/ci.yml`) needs no secrets and doesn't touch deployment — it only verifies lint/typecheck/tests/build stay green on every push.
