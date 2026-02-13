import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'
import { headers as getHeaders } from 'next/headers.js'

import Link from 'next/link'
import config from '@payload-config'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav">
        <Link href="/dashboard">My Sites</Link>
        <Link href="/admin" target="_blank" rel="noopener noreferrer">
          Control Panel
        </Link>
        <Link href="/studio" target="_blank" rel="noopener noreferrer">
          Content Studio
        </Link>
        <span className="dashboard-user">{user.email}</span>
      </nav>
      <main className="dashboard-main">{children}</main>
    </div>
  )
}
