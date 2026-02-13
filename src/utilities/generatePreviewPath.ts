import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  // For pages with no slug yet (new doc), show homepage preview so iframe loads something
  const effectiveSlug =
    slug === undefined || slug === null || slug === ''
      ? collection === 'pages'
        ? 'home'
        : null
      : slug

  if (effectiveSlug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(effectiveSlug)

  const encodedParams = new URLSearchParams({
    slug: effectiveSlug,
    collection,
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`.replace(/\/$/, '') || '/',
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
