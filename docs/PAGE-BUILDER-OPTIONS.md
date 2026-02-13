# Page builder options: Payload, Sanity, and custom drag-and-drop

This doc summarizes **prebuilt** options in Payload and Sanity for building pages (content + styling) and how to add a **custom** drag-and-drop website builder.

---

## Current setup: Sanity + Payload mixed

- **Sanity** is used to **edit** page builder content with **Presentation** (drag-and-drop in preview):
  - Document type: **Page (Builder)** (`pageBuilder`) in Studio at `/studio`.
  - Fields: title, slug, hero (rich text + image or Payload media URL), **sections** (CTA, Content, Media, Archive, Form), meta.
  - Sections support **Section style** (background, padding, width) and render on the frontend with the same look as Payload blocks.
- **Frontend** (`/[slug]`): Tries **Sanity first** (fetch `pageBuilder` by slug). If found, renders `SanityHero` + `RenderSanitySections`. Otherwise falls back to **Payload** pages (existing `RenderHero` + `RenderBlocks`).
- **Payload** remains the source for: media (optional – sections can use Payload media URL), forms (Form section uses Payload form by slug), users, sites, redirects, and non-builder pages.
- **Draft mode**: `/api/draft-mode/enable` and `/api/draft-mode/disable` are used by Sanity Presentation. Optional `SANITY_PREVIEW_SECRET` for production.

---

## What you already have

- **Payload**: Pages with a **Blocks** field (CTA, Content, Media, Archive, Form). Editors reorder blocks in the admin; the frontend renders them via `RenderBlocks`. **Block-level styling** is now available: each block has an optional "Block style" group (background, vertical padding, content width) so you can control appearance per block without code.
- **Sanity**: Studio at `/studio` with `pageContent` (title, slug, body). No page-builder UI yet; you can add one via Presentation or a custom builder that writes to Sanity.

---

## Prebuilt options

### Payload

| Feature | Built-in? | Notes |
|--------|-----------|--------|
| **Blocks + reorder** | ✅ Yes | Drag to reorder blocks in the admin. No frontend canvas. |
| **Block styling** | ✅ Yes (added) | Per-block style group: background, padding, max width. |
| **Visual editor** | Enterprise | [Payload Visual Editor](https://payloadcms.com/enterprise/visual-editor) – WYSIWYG in-context editing (paid). |
| **Community** | Third-party | [Payload Blocks](https://payloadblocks.dev/), [Payblocks](https://payblocks.trieb.work/) – more block templates; no full drag-drop canvas. |

So in Payload you get **content + styling** from the admin (blocks + style fields). For a true **frontend** drag-and-drop canvas (like Webflow), you’d add a custom builder (see below).

### Sanity

| Feature | Built-in? | Notes |
|--------|-----------|--------|
| **Presentation tool** | ✅ Yes | Visual editing + **drag-and-drop** in the preview. Reorder array items (e.g. page sections) in the live preview. |
| **Drag-and-drop** | ✅ Yes | [Enabling drag-and-drop](https://www.sanity.io/docs/enabling-drag-and-drop) – array-based content, `createDataAttribute` on frontend. |
| **Styling in Studio** | Schema | Add object types for “section style” (background, padding, etc.) and render them on the frontend. |

To use Sanity as the page builder:

1. Model pages as **array of sections/blocks** (e.g. hero, CTA, content, media).
2. Enable **Presentation** and **Visual Editing** in Sanity Studio.
3. On the frontend, use **`next-sanity`** (or your framework client) and `createDataAttribute` so drag-and-drop and click-to-edit work.
4. Add **style fields** to section types (background, padding, width) and map them to CSS/Tailwind in your components.

---

## Custom drag-and-drop website builder (Payload or Sanity)

If you want a **custom** builder (e.g. block palette + canvas, save to Payload or Sanity):

### Option A: Builder that writes to Payload

- **Route**: e.g. `/dashboard/builder` or `/builder/[pageId]`.
- **UI**: Block palette (left), canvas (center), style panel (right). Drag blocks onto the canvas; select a block to edit styles.
- **Tech**: React + a DnD library (`@dnd-kit/core` or `react-beautiful-dnd`), or a low-code layer (GrapesJS, Craft.js).
- **Data**: Load page from Payload (REST/GraphQL), edit `layout` (blocks array) and optional `pageStyles` in state, then PATCH the page. Your existing `RenderBlocks` + block style fields can stay as-is; the builder just edits the same payload.
- **Styling**: Reuse the same block style fields (background, padding, maxWidth) and optionally add more (e.g. border, shadow) in Payload.

### Option B: Builder that writes to Sanity

- Same idea, but PATCH/mutate Sanity documents (e.g. `pageContent` or a dedicated `pageBuilder` document) with an array of sections. Frontend still renders from Sanity; Presentation can optionally sit alongside the custom builder.

### Option C: Third-party headless builder

- **Builder.io**, **GrapesJS**, etc. can provide the canvas and UI; you sync the output (HTML or JSON) to Payload or Sanity via API. More integration work; good if you want a ready-made UI and don’t mind mapping their schema to yours.

---

## Recommended next steps

1. **Use what you have**: Edit pages in Payload admin, set **Block style** (background, padding, width) per block, and use Live Preview. No new app.
2. **Optional – Sanity as builder**: Model page sections in Sanity, enable Presentation + drag-and-drop, add style fields, and render in your frontend; use Sanity as the source of truth for “builder” pages if you prefer it over Payload for that.
3. **Optional – Custom builder**: Add a `/builder` (or dashboard) route, block palette + canvas, save to Payload (or Sanity). Start with a minimal version: list of block types, drop zone, save `layout` + styles to the existing Payload page API.

If you say which path you prefer (Payload-only, Sanity-only, or custom builder and where it should save), the next step can be a concrete schema + API + route plan (or code stubs) for that path.
