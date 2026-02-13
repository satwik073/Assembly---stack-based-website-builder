import React from 'react'
import Image from 'next/image'
import { PortableText } from '@/components/Sanity/PortableText'
import { urlFor } from '@/sanity/lib/image'
import { toPublicMediaPath } from '@/utilities/getMediaUrl'

type SanityHeroProps = {
  hero?: {
    type?: string
    richText?: unknown[]
    media?: { asset?: { _ref?: string }; alt?: string } | null
    payloadMediaUrl?: string | null
  } | null
}

export function SanityHero({ hero }: SanityHeroProps) {
  if (!hero) return null

  const payloadUrl = hero.payloadMediaUrl
  const publicPath = typeof payloadUrl === 'string' ? toPublicMediaPath(payloadUrl) : null
  const imageUrl = publicPath ?? payloadUrl ?? (hero.media?.asset ? urlFor(hero.media).width(1200).url() : null)

  return (
    <section className="container py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <PortableText value={hero.richText as never} />
        </div>
        {imageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-md">
            <Image
              src={imageUrl}
              alt={(hero.media as { alt?: string })?.alt ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>
    </section>
  )
}
