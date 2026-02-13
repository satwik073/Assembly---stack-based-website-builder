import { defineDocuments, defineLocations } from 'sanity/presentation'

/** Maps Sanity pageBuilder documents to frontend routes for Presentation tool. */
export const locations = {
  pageBuilder: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => ({
      locations: [
        {
          title: doc.title ?? 'Untitled',
          href: doc.slug ? `/${doc.slug}` : '/',
        },
      ],
    }),
  }),
}

/** Tells Presentation which document to open when the preview URL is / or /:slug. */
export const mainDocuments = defineDocuments([
  {
    route: '/',
    filter: `_type == "pageBuilder" && slug.current == "home"`,
  },
  {
    route: '/:slug',
    filter: `_type == "pageBuilder" && slug.current == $slug`,
    params: (slug: string) => ({ slug }),
  },
])
