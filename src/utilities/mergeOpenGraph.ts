import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Web Builder'
const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Build and manage your website. Pages, posts, and content in one place.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName,
  title: siteName,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
