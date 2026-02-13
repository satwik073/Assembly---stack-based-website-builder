import type { Page as PageType, Redirect } from '@/payload-types'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import { headers as getHeaders } from 'next/headers.js'

import config from '@payload-config'
import { getSiteOrigin } from '@/utilities/getURL'

function getPageSiteId(page: PageType): string | null {
  if (!page?.site) return null
  const site = page.site
  return typeof site === 'object' && site !== null ? String((site as { id?: number }).id) : String(site)
}

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const [sitesResult, redirectsResult] = await Promise.all([
    payload.find({
      collection: 'sites',
      where: { owner: { equals: user!.id } },
      limit: 100,
      depth: 1,
    }),
    payload.find({
      collection: 'redirects',
      depth: 2,
      limit: 0,
      pagination: false,
    }),
  ])

  const sites = sitesResult.docs
  const allRedirects = redirectsResult.docs as Redirect[]

  const redirectsBySiteId = new Map<string, Redirect[]>()
  for (const r of allRedirects) {
    const ref = r.to?.reference
    if (!ref || ref.relationTo !== 'pages' || !ref.value) continue
    const page = ref.value as PageType
    const siteId = getPageSiteId(page)
    if (!siteId) continue
    const list = redirectsBySiteId.get(siteId) ?? []
    list.push(r)
    redirectsBySiteId.set(siteId, list)
  }

  return (
    <div className="dashboard-page">
      <h1>My Sites</h1>
      <div className="dashboard-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Link href="/dashboard/sites/new" className="btn-primary">
          Create site
        </Link>
        <Link href="/admin/collections/redirects" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Manage redirects
        </Link>
      </div>
      {sites.length === 0 ? (
        <p>No sites yet. Create your first site.</p>
      ) : (
        <table className="sites-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border, #e5e5e5)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem' }}>Name</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Subdomain</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Site URL</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Owner</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Header nav items</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Footer nav items</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Description</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Redirects</th>
              <th style={{ padding: '0.5rem 0.75rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => {
              const siteRedirects = redirectsBySiteId.get(String(site.id)) ?? []
              const owner = site.owner
              const ownerName =
                typeof owner === 'object' && owner !== null && 'name' in owner
                  ? (owner as { name?: string }).name
                  : null
              const headerCount = Array.isArray((site as { headerNavItems?: unknown[] }).headerNavItems)
                ? (site as { headerNavItems: unknown[] }).headerNavItems.length
                : 0
              const footerCount = Array.isArray((site as { footerNavItems?: unknown[] }).footerNavItems)
                ? (site as { footerNavItems: unknown[] }).footerNavItems.length
                : 0
              const description = (site as { description?: string }).description ?? '—'
              return (
                <tr key={site.id} style={{ borderBottom: '1px solid var(--border, #e5e5e5)' }}>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <Link href={`/dashboard/sites/${site.id}`} style={{ fontWeight: 600 }}>
                      {site.name}
                    </Link>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{site.subdomain}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <a
                      href={`${getSiteOrigin(site.subdomain)}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline' }}
                    >
                      {`${getSiteOrigin(site.subdomain)}/`}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{ownerName ?? '—'}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{headerCount} Header nav items</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{footerCount} Footer nav items</td>
                  <td style={{ padding: '0.5rem 0.75rem', maxWidth: '12rem' }} title={description}>
                    {description.length > 60 ? `${description.slice(0, 60)}…` : description}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    {siteRedirects.length === 0 ? (
                      <span style={{ color: 'var(--muted-foreground, #71717a)' }}>{siteRedirects.length} Redirects</span>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                        {siteRedirects.map((r) => {
                          const path =
                            r.to?.url ??
                            (r.to?.reference?.value && typeof r.to.reference.value === 'object'
                              ? r.to.reference.relationTo === 'posts'
                                ? `/posts/${(r.to.reference.value as { slug?: string }).slug}`
                                : `/${(r.to.reference.value as { slug?: string }).slug}`
                              : null)
                          const siteOrigin = getSiteOrigin(site.subdomain)
                          const redirectHref = path ? (path.startsWith('http') ? path : `${siteOrigin}${path}`) : null
                          return (
                            <li key={r.id}>
                              <code style={{ fontSize: '0.8em' }}>{r.from}</code>
                              {' → '}
                              {redirectHref ? (
                                <a href={redirectHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                                  {path ?? r.to?.url ?? '—'}
                                </a>
                              ) : (
                                r.to?.url ?? '—'
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <Link href={`/dashboard/sites/${site.id}`}>View</Link>
                    {' · '}
                    <Link href="/admin/collections/redirects" target="_blank" rel="noopener noreferrer">
                      Redirects
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
