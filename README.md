# Web Builder

Production-scalable website builder using **Payload Website Template** + **Sites** (multi-tenant) + **Sanity**.

## Features

- **Payload (website template)**: Pages (hero + layout blocks: CTA, Content, Media, Archive, Form), Posts, Categories, Media, Header/Footer globals. SEO, Redirects, Search, Form Builder, Nested Docs. Live preview, drafts.
- **Sites**: Multi-tenant; create site (name + subdomain), optional `site` on Pages for subdomain sites.
- **Sanity**: Page content (Portable Text), embedded Studio at `/studio`.
- **Auth**: Login / Sign up; dashboard for “My Sites”.
- **Subdomain**: Public sites at `{subdomain}.localhost:3000` (local).

## Setup

1. **Env**

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: Neon Postgres connection string.
   - `PAYLOAD_SECRET`: Random secret (min 32 chars).
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`: From [sanity.io/manage](https://sanity.io/manage).
   - `NEXT_PUBLIC_APP_URL`: e.g. `http://localhost:3000`.

2. **Install & run**

   ```bash
   pnpm install
   pnpm dev
   ```

3. **First user**

   - Open [http://localhost:3000/admin](http://localhost:3000/admin) and create the first user (or use Sign up on the home page if enabled).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home (login / sign up / dashboard link) |
| `/login` | Log in |
| `/signup` | Sign up |
| `/dashboard` | My sites (requires auth) |
| `/dashboard/sites/new` | Create site |
| `/dashboard/sites/[id]` | Site detail, link to Payload + Sanity |
| `/admin` | Payload Admin |
| `/studio` | Sanity Studio |
| `{subdomain}.localhost:3000` | Public site (e.g. `mysite.localhost:3000`) |

## Subdomain (local)

- Use `mysite.localhost:3000` to view the site for subdomain `mysite`.
- Ensure a site exists in Payload with that subdomain and at least one page (slug e.g. `home` for `/`).

## Tech

- Next.js 15 (App Router), Payload 3, Sanity 3, Neon Postgres.
# Omgera-arobix2.0
# Omgera-arobix2.0
