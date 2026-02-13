import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

import config from '@payload-config'

export async function POST(request: Request) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const name = body.name || 'My Site'
  let subdomain = (body.subdomain || name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  if (!subdomain) subdomain = `site-${Date.now().toString(36)}`

  try {
    const doc = await payload.create({
      collection: 'sites',
      draft: false,
      data: {
        name,
        subdomain,
        owner: user.id,
        description: body.description ?? '',
      },
    })
    return NextResponse.json({ doc })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site'
    return NextResponse.json({ errors: [{ message }] }, { status: 400 })
  }
}
