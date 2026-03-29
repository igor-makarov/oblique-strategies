This repository is a new impl of Oblique Strategies in React Router with SSG.

Reference impl: https://github.com/nomatteus/oblique-strategies

# Basic rules

- Type check: `npm run check`
- Format: `npm run format`
- Build: `npm run build` (noisy, use grep, head, tail)
- See the rest in the `package.json`
- RR7 routes are in `app/routes.ts`


# RR7 + Cloudflare Pages Nuances

- Traliling slash: always add
- Regenerate Wrangler types: `npx wrangler types`
