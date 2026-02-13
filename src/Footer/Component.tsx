import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

type FooterProps = {
  /** When set, use this instead of global (e.g. site-specific footer). */
  data?: Footer | null
  /** Base path for logo/nav when in site context (e.g. /site/mysite). */
  basePath?: string
}

export async function Footer(props: FooterProps) {
  const footerData: Footer = props.data ?? (await getCachedGlobal('footer', 1)())
  const basePath = props.basePath ?? '/'
  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href={basePath}>
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} basePath={basePath} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
