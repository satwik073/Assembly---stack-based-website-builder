import React from 'react'
import { ArchiveSection } from './ArchiveSection'
import { ContentSection } from './ContentSection'
import { CtaSection } from './CtaSection'
import { FormSection } from './FormSection'
import { MediaSection } from './MediaSection'
import type { BlockStyle } from '@/utilities/blockStyleClassName'

export type SanitySection = {
  _type: string
  _key?: string
  style?: BlockStyle
  richText?: unknown[]
  links?: Array<{ label?: string; href?: string; appearance?: string }>
  columns?: Array<{
    size?: string
    richText?: unknown[]
    enableLink?: boolean
    linkLabel?: string
    linkHref?: string
  }>
  media?: { asset?: { _ref?: string }; alt?: string } | null
  payloadMediaUrl?: string | null
  introContent?: unknown[]
  limit?: number
  formSlug?: string | null
  enableIntro?: boolean
}

const sectionComponents: Record<string, React.ComponentType<SanitySection>> = {
  ctaSection: CtaSection as React.ComponentType<SanitySection>,
  contentSection: ContentSection as React.ComponentType<SanitySection>,
  mediaSection: MediaSection as React.ComponentType<SanitySection>,
  archiveSection: ArchiveSection as React.ComponentType<SanitySection>,
  formSection: FormSection as unknown as React.ComponentType<SanitySection>,
}

export async function RenderSanitySections({ sections }: { sections?: SanitySection[] | null }) {
  if (!sections?.length) return null
  const nodes = await Promise.all(
    sections.map(async (section) => {
      const Component = section._type ? sectionComponents[section._type] : null
      if (!Component) return null
      const element = (Component as (p: SanitySection) => React.ReactElement | Promise<React.ReactElement>)(
        section
      )
      const resolved = element instanceof Promise ? await element : element
      return <React.Fragment key={section._key ?? section._type}>{resolved}</React.Fragment>
    })
  )
  return <>{nodes.filter(Boolean)}</>
}
