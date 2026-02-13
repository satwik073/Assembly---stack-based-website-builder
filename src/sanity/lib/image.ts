import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = client ? imageUrlBuilder(client) : null

/** Build Sanity CDN URL for an image (asset ref or image document). No-op when Sanity is not configured. */
export function urlFor(source: SanityImageSource) {
  if (!builder) return { width: () => ({ url: () => '' }), url: () => '' }
  return builder.image(source)
}
