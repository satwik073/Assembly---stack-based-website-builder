import React from 'react'
import Link from 'next/link'
import { PortableText } from '@/components/Sanity/PortableText'
import { getBlockStyleClassName } from '@/utilities/blockStyleClassName'
import type { BlockStyle } from '@/utilities/blockStyleClassName'
import { cn } from '@/utilities/ui'

const colsSpanClasses: Record<string, string> = {
  full: '12',
  half: '6',
  oneThird: '4',
  twoThirds: '8',
}

type Column = {
  size?: string
  richText?: unknown[]
  enableLink?: boolean
  linkLabel?: string
  linkHref?: string
}

type ContentSectionProps = {
  style?: BlockStyle
  columns?: Column[]
}

export function ContentSection({ style, columns }: ContentSectionProps) {
  if (!columns?.length) return null
  return (
    <div className={getBlockStyleClassName(style)}>
      <div className="container">
        <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
          {columns.map((col, index) => (
            <div
              key={index}
              className={cn(
                `col-span-4 lg:col-span-${colsSpanClasses[col.size ?? 'full'] ?? '12'}`,
                col.size !== 'full' && 'md:col-span-2'
              )}
            >
              <PortableText value={col.richText as never} />
              {col.enableLink && col.linkHref && (
                <Link href={col.linkHref} className="text-primary underline">
                  {col.linkLabel ?? 'Read more'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
