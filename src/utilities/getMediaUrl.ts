import { getClientSideURL } from '@/utilities/getURL'

/** Payload media API path pattern; maps to static assets in public/media/ */
const PAYLOAD_MEDIA_FILE_REGEX = /\/api\/media\/file\/([^/?]+)(?:\?|$)/

/** If url is a Payload media API URL/path, return public path /media/filename for next/image */
export function toPublicMediaPath(url: string | null | undefined): string | null {
  if (!url) return null
  const fileMatch = url.match(PAYLOAD_MEDIA_FILE_REGEX)
  if (fileMatch) return `/media/${fileMatch[1]}`
  return null
}

/**
 * If url is a Payload media API path, return the equivalent public path so next/image
 * serves from public/media/ (no remotePatterns needed). Otherwise format URL as before.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const fileMatch = url.match(PAYLOAD_MEDIA_FILE_REGEX)
  if (fileMatch) {
    const filename = fileMatch[1]
    return `/media/${filename}`
  }

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
