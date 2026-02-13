import React from 'react'
import Link from 'next/link'
import { PortableText } from '@/components/Sanity/PortableText'
import { getBlockStyleClassName } from '@/utilities/blockStyleClassName'
import type { BlockStyle } from '@/utilities/blockStyleClassName'

type ArchiveSectionProps = {
  style?: BlockStyle
  introContent?: unknown[]
  limit?: number
}

/** Renders intro from Content Studio + link to posts (posts list lives in the CMS). */
export function ArchiveSection({ style, introContent }: ArchiveSectionProps) {
  return (
    <div className={getBlockStyleClassName(style)}>
      <div className="container">
        {introContent?.length ? (
          <div className="mb-8">
            <PortableText value={introContent as never} />
          </div>
        ) : null}
        <Link href="/posts" className="text-primary underline">
          View all posts
        </Link>
      </div>
    </div>
  )
}
