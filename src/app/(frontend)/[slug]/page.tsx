import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { configPromise } from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderSanitySections } from '@/components/Sanity/Sections'
import { SanityHero } from '@/components/Sanity/SanityHero'
import { getClient } from '@/sanity/lib/client-preview'
import { pageBuilderBySlugQuery } from '@/sanity/queries/pageBuilder'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug

  // Try Sanity page builder first when Sanity is configured (NEXT_PUBLIC_SANITY_PROJECT_ID set)
  const sanityClient = getClient(draft)
  const sanityPage = sanityClient
    ? await sanityClient.fetch<{
        title?: string
        slug?: string
        hero?: unknown
        sections?: unknown[]
      } | null>(pageBuilderBySlugQuery, { slug: decodedSlug })
    : null

  if (sanityPage) {
    return (
      <article className="pt-16 pb-24">
        <PageClient />
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}
        <SanityHero hero={sanityPage.hero as never} />
        <RenderSanitySections sections={sanityPage.sections as never} />
      </article>
    )
  }

  // Fall back to CMS pages
  let page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageBySlug({
    slug: decodedSlug,
    draft,
  })

  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const sanityClient = getClient(false)
  const sanityPage = sanityClient
    ? await sanityClient.fetch<{
        metaTitle?: string
        metaDescription?: string
        title?: string
      } | null>(pageBuilderBySlugQuery, { slug: decodedSlug })
    : null

  if (sanityPage) {
    return {
      title: sanityPage.metaTitle ?? sanityPage.title,
      description: sanityPage.metaDescription ?? undefined,
    }
  }

  const page = await queryPageBySlug({
    slug: decodedSlug,
    draft: false,
  })
  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, draft = false }: { slug: string; draft?: boolean }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
