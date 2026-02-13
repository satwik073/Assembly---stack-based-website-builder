/**
 * GROQ query for a pageBuilder document by slug.
 * Fetches hero, sections (with style), and meta for rendering.
 */
export const pageBuilderBySlugQuery = `
  *[_type == "pageBuilder" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    hero {
      type,
      richText,
      media { asset-> },
      payloadMediaUrl
    },
    sections[] {
      _type,
      _key,
      style {
        backgroundColor,
        paddingY,
        maxWidth
      },
      richText,
      links[] { label, href, appearance },
      columns[] { size, richText, enableLink, linkLabel, linkHref },
      media { asset-> },
      payloadMediaUrl,
      introContent,
      limit,
      formSlug,
      enableIntro,
      introContent
    },
    metaTitle,
    metaDescription
  }
`
