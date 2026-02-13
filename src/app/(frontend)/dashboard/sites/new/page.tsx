'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewSitePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/create-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          subdomain: subdomain?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || undefined,
        }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.errors?.[0]?.message || 'Failed to create site')
        return
      }
      const data = await res.json()
      router.push(`/dashboard/sites/${data.doc.id}`)
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <h1>Create site</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="auth-error">{error}</p>}
        <label>
          Site name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Site"
            required
          />
        </label>
        <label>
          Subdomain
          <input
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="mysite"
          />
        </label>
        <p className="form-hint">Your site will be at: {subdomain || '…'}.your-domain.com</p>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create site'}
        </button>
      </form>
      <Link href="/dashboard">Back to sites</Link>
    </div>
  )
}
