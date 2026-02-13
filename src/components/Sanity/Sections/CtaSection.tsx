import React from 'react'
import Link from 'next/link'
import { PortableText } from '@/components/Sanity/PortableText'
import { getBlockStyleClassName } from '@/utilities/blockStyleClassName'
import type { BlockStyle } from '@/utilities/blockStyleClassName'
import { cn } from '@/utilities/ui'

type CtaSectionProps = {
  style?: BlockStyle
  richText?: unknown[]
  links?: Array<{ label?: string; href?: string; appearance?: string }>
}

export function CtaSection({ style, richText, links }: CtaSectionProps) {
  return (
    <div className={getBlockStyleClassName(style)}>
      <div className="container">
        <div className="bg-card rounded border border-border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
          <div className="max-w-[48rem] flex items-center">
            <PortableText value={richText as never} />
          </div>
          <div className="flex flex-col gap-8">
            {(links ?? []).map((link, i) => (
              <Link
                key={i}
                href={link.href ?? '#'}
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium transition-colors',
                  link.appearance === 'outline'
                    ? 'border border-input bg-background hover:bg-muted'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {link.label ?? 'Link'}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
