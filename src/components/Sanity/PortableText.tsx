'use client'

import { PortableText as PortableTextReact, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import React from 'react'
import { cn } from '@/utilities/ui'

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-bold">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-semibold">{children}</h4>,
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1">{children}</li>,
    number: ({ children }) => <li className="mb-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className="rounded bg-muted px-1">{children}</code>,
    link: ({ children, value }) => (
      <a href={value?.href} className="text-primary underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

export function PortableText({
  value,
  className,
}: {
  value: PortableTextBlock[] | null | undefined
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
      <PortableTextReact value={value} components={components} />
    </div>
  )
}
