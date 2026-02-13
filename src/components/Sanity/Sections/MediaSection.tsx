import React from 'react'
import Image from 'next/image'
import { getBlockStyleClassName } from '@/utilities/blockStyleClassName'
import type { BlockStyle } from '@/utilities/blockStyleClassName'
import { urlFor } from '@/sanity/lib/image'
import { toPublicMediaPath } from '@/utilities/getMediaUrl'

type MediaSectionProps = {
  style?: BlockStyle
  media?: { asset?: { _ref?: string }; alt?: string } | null
  payloadMediaUrl?: string | null
}

export function MediaSection({ style, media, payloadMediaUrl }: MediaSectionProps) {
  const payloadUrl = payloadMediaUrl ?? null
  const publicPath = typeof payloadUrl === 'string' ? toPublicMediaPath(payloadUrl) : null
  const sanityUrl = media?.asset ? urlFor(media).width(1200).url() : null
  const imageUrl = publicPath ?? payloadUrl ?? sanityUrl
  if (!imageUrl) return null

  return (
    <div className={getBlockStyleClassName(style)}>
      <div className="container">
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt={(media as { alt?: string })?.alt ?? ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      </div>
    </div>
  )
}
