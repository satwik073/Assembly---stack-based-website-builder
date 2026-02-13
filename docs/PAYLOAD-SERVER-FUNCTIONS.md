# Payload CMS + Next.js: ServerFunctionsProvider & SlugField

## Where the error comes from

- **Thrown in:** `node_modules/@payloadcms/ui` → `useServerFunctions()` hook.
- **Used by:** Payload’s built-in `SlugField` (and other admin UI). You don’t have a custom SlugField file; it’s inside the Payload UI package.

### Why the stack trace says `../../../src/fields/Slug/index.tsx`

That path is **not** from your project. It comes from **Payload’s source map**:

- In `node_modules/@payloadcms/ui/dist/fields/Slug/index.js.map` the `sources` entry is `["../../../src/fields/Slug/index.tsx"]`.
- So the stack trace is showing the **@payloadcms/ui package’s** original source path (Payload monorepo layout), not `src/fields/Slug` in your repo.
- You do **not** have a local `src/fields/Slug` override. Your `importMap.js` correctly maps SlugField to `@payloadcms/next/rsc#SlugField`, not to `@/fields/Slug`.

## Payload 2 vs Payload 3

The research you found refers to **Payload 2.x**:

- **Payload 2:** Uses `PayloadAdmin({ config })` from `@payloadcms/next/admin`.
- **Payload 3 (your setup):** Uses:
  - **Layout:** `RootLayout` from `@payloadcms/next/layouts` with `configPromise`, `importMap`, `serverFunction`.
  - **Page:** `RootPage` from `@payloadcms/next/views` with `config`, `params`, `searchParams`, `importMap`.

So you do **not** need to switch to `PayloadAdmin`; that API doesn’t exist in Payload 3. Your `(payload)/layout.tsx` and `admin/[[...segments]]/page.tsx` are the correct Payload 3 pattern.

## Your setup (correct)

1. **Admin page** – `app/(payload)/admin/[[...segments]]/page.tsx`  
   Uses `RootPage({ config: configPromise, params, searchParams, importMap })`. ✅

2. **Payload layout** – `app/(payload)/layout.tsx`  
   Uses `RootLayout` with `configPromise`, `importMap`, `serverFunction`. ✅

3. **Slug field** – You use Payload’s `slugField()` in `Pages` and `Posts`; you are **not** importing `SlugField` manually. ✅

4. **Root layout** – `app/layout.tsx`  
   For `/admin` and `/api`, the root layout returns only `{children}` (no extra `<html>`/`<body>`), so Payload’s layout is the only document root and its `ServerFunctionsProvider` wraps the admin UI. This fixes the “useServerFunctions must be used within a ServerFunctionsProvider” error. ✅

## What was going wrong

- The **root** layout was wrapping the whole app (including `/admin`) in its own `<html>`/`<body>`.
- Payload’s **RootLayout** also renders its own `<html>`/`<body>` and `ServerFunctionsProvider`.
- Having two “documents” broke the React tree so admin components (e.g. SlugField) no longer saw Payload’s provider.

## Fix applied

- **Middleware** sets a header with the current pathname.
- **Root layout** checks that header; for paths starting with `/admin` or `/api` it returns only `{children}`.
- So for `/admin`, only Payload’s layout provides the document and `ServerFunctionsProvider`, and the SlugField (and other admin UI) see the correct context.

## Optional: slug without SlugField UI

If you ever want to **remove** the slug field from the admin UI and only auto-generate it (no manual slug input), you can use a plain `text` field + hooks and **not** use `slugField()`:

```ts
{
  name: 'slug',
  type: 'text',
  required: true,
  admin: { description: 'Auto-generated from title' },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title) {
          data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
  },
}
```

That avoids any admin UI that uses `useServerFunctions()`. For normal use, keeping `slugField()` and the current root-layout fix is the right approach.
