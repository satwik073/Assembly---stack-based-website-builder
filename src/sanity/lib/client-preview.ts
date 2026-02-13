import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

/** Base URL for Sanity Studio (used by stega for visual editing). */
const studioUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

/** Use for server-side fetches when draft mode is enabled (e.g. Sanity Presentation). Returns null if Sanity is not configured. */
export function getClient(preview = false) {
  if (!projectId) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !preview,
    perspective: preview ? 'previewDrafts' : 'published',
    stega: preview ? { studioUrl: `${studioUrl}/studio` } : false,
  })
}
