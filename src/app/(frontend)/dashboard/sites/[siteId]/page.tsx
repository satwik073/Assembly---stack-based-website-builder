import type { Page as PageType, Redirect } from '@/payload-types'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { headers as getHeaders } from 'next/headers.js'

import config from '@payload-config'
import { getSiteOrigin } from '@/utilities/getURL'

function getPageSiteId(page: PageType): string | null {
  if (!page?.site) return null
  const site = page.site
  return typeof site === 'object' && site !== null
    ? String((site as { id?: number }).id)
    : String(site)
}

function redirectToLabel(redirect: Redirect): string {
  if (redirect.to?.url) return redirect.to.url
  const ref = redirect.to?.reference
  if (!ref?.value) return '—'
  const value = ref.value
  if (typeof value === 'object' && value !== null && 'slug' in value) {
    const prefix = ref.relationTo === 'posts' ? '/posts/' : '/'
    return `${prefix}${value.slug}`
  }
  return '—'
}

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const site = await payload.findByID({
    collection: 'sites',
    id: siteId,
  })

  const ownerId = typeof site.owner === 'object' && site.owner !== null ? site.owner.id : site.owner
  if (!site || String(ownerId) !== String(user?.id)) {
    notFound()
  }

  const [pagesResult, redirectsResult, apiEndpointsResult] = await Promise.all([
    payload.find({
      collection: 'pages',
      where: { site: { equals: siteId } },
      limit: 100,
    }),
    payload.find({
      collection: 'redirects',
      depth: 2,
      limit: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'api-endpoints',
      where: { site: { equals: siteId } },
      limit: 100,
    }),
  ])

  const pages = pagesResult.docs
  const allRedirects = redirectsResult.docs as Redirect[]
  const siteRedirects = allRedirects.filter((r) => {
    const ref = r.to?.reference
    if (!ref || ref.relationTo !== 'pages' || !ref.value) return false
    const page = ref.value as PageType
    return getPageSiteId(page) === siteId
  })
  const apiEndpoints = apiEndpointsResult.docs

  const siteRedirectUrl = `${getSiteOrigin(site.subdomain)}/`

  return (
    <div className="dashboard-page">
      <h1>{site.name}</h1>
      <table
        className="sites-table"
        style={{ width: '100%', maxWidth: '40rem', borderCollapse: 'collapse', marginTop: '1rem' }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border, #e5e5e5)', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem 0.75rem' }}>Subdomain</th>
            <th style={{ padding: '0.5rem 0.75rem' }}>Site URL (redirect)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid var(--border, #e5e5e5)' }}>
            <td style={{ padding: '0.5rem 0.75rem' }}>{site.subdomain}</td>
            <td style={{ padding: '0.5rem 0.75rem' }}>
              <a
                href={siteRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
              >
                {siteRedirectUrl}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="dashboard-actions">
        <Link
          href="/admin/collections/pages"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Edit pages
        </Link>
        <Link href="/studio" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Edit content
        </Link>
        <Link
          href="/admin/collections/redirects"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Manage redirects
        </Link>
        <Link
          href={`/dashboard/sites/${siteId}/api`}
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          ⚡ API Integration Hub
        </Link>
      </div>
      <h2>Pages</h2>
      <ul className="sites-list">
        {pages.length === 0 ? (
          <li>No pages. Create pages in the Control Panel.</li>
        ) : (
          pages.map((page) => (
            <li key={page.id}>
              <Link href={`/dashboard/sites/${siteId}/pages/${page.id}`}>
                {page.title} — /{page.slug}
              </Link>
            </li>
          ))
        )}
      </ul>
      <h2>Redirects</h2>
      {siteRedirects.length === 0 ? (
        <p>
          No redirects for this site. Add redirects in Control Panel → Redirects (they must point to
          a page of this site).
        </p>
      ) : (
        <ul className="sites-list">
          {siteRedirects.map((r) => (
            <li key={r.id}>
              <code>{r.from}</code> → {redirectToLabel(r)}
            </li>
          ))}
        </ul>
      )}
      <h2>API Endpoints</h2>
      {apiEndpoints.length === 0 ? (
        <p>
          No API endpoints. Use the{' '}
          <Link href={`/dashboard/sites/${siteId}/api`}>Integration Hub</Link> to create one.
        </p>
      ) : (
        <ul className="sites-list">
          {apiEndpoints.map((ep: any) => (
            <li key={ep.id}>
              <Link href={`/dashboard/sites/${siteId}/api`}>
                <span style={{ fontWeight: 600, marginRight: '8px' }}>{ep.method}</span>
                {ep.name} — <code style={{ fontSize: '0.85em' }}>{ep.url}</code>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/dashboard">Back to sites</Link>
    </div>
  )
}
