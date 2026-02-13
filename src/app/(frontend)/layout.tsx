import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { headers } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import { getServerSideURL } from '@/utilities/getURL'
import { getPayload } from 'payload'
import { configPromise } from '@payload-config'

import './globals.css'
import './styles.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  const isSiteContext = pathname.startsWith('/site/')
  const subdomain = isSiteContext ? pathname.split('/')[2] ?? '' : ''
  const basePath = isSiteContext && subdomain ? `/site/${subdomain}` : '/'

  let siteHeaderData: { navItems?: Array<{ link: unknown }> } | null = null
  let siteFooterData: { navItems?: Array<{ link: unknown }> } | null = null

  if (isSiteContext && subdomain) {
    const payload = await getPayload({ config: configPromise })
    const sites = await payload.find({
      collection: 'sites',
      where: { subdomain: { equals: subdomain } },
      limit: 1,
      depth: 1,
    })
    const site = sites.docs[0]
    if (site) {
      siteHeaderData = { navItems: (site as { headerNavItems?: Array<{ link: unknown }> }).headerNavItems ?? [] }
      siteFooterData = { navItems: (site as { footerNavItems?: Array<{ link: unknown }> }).footerNavItems ?? [] }
    }
  }

  const showSiteHeaderFooter = isSiteContext && siteHeaderData !== null && siteFooterData !== null

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          {/* Header and Footer only when visiting a site subdomain (e.g. mysite.localhost); main domain has none */}
          {showSiteHeaderFooter ? (
            <>
              <Header data={siteHeaderData as never} basePath={basePath} />
              {children}
              <Footer data={siteFooterData as never} basePath={basePath} />
            </>
          ) : (
            <>{children}</>
          )}
        </Providers>
      </body>
    </html>
  )
}

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Web Builder'

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: 'Build and manage your website. Pages, posts, and content in one place.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
