import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

import config from '@payload-config'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string; slug?: string[] }>
}) {
  const { subdomain, slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const sites = await payload.find({
    collection: 'sites',
    where: { subdomain: { equals: subdomain } },
    limit: 1,
  })

  const site = sites.docs[0]
  if (!site) notFound()

  const path = slug?.join('/') || ''
  const pageSlug = path || 'home'

  const pages = await payload.find({
    collection: 'pages',
    where: {
      site: { equals: site.id },
      slug: { equals: pageSlug },
    },
    draft: false,
    limit: 1,
  })

  const page = pages.docs[0]
  if (!page) {
    return (
      <div className="public-site">
        <header>
          <h1>{site.name}</h1>
        </header>
        <main>
          <p>Page not found.</p>
        </main>
      </div>
    )
  }

  const { hero, layout } = page

  return (
    <div className="public-site">
      <header>
        <h1>{site.name}</h1>
      </header>
      <main>
        <article className="pt-16 pb-24">
          <RenderHero {...hero} />
          <RenderBlocks blocks={layout || []} />
        </article>
      </main>
    </div>
  )
}
