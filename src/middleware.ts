import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAIN_HOSTS = ['localhost', '127.0.0.1']

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]

  // Pass pathname to server via REQUEST header so root layout can read it (response headers aren't visible to layouts)
  const requestHeaders = new Headers(request.headers)

  // Skip if already going to app routes
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/next')
  ) {
    requestHeaders.set('x-pathname', url.pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  let isMainHost = MAIN_HOSTS.includes(hostname)
  if (
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    isMainHost = true
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    try {
      const parsed = new URL(process.env.NEXT_PUBLIC_SERVER_URL)
      if (hostname === parsed.hostname) {
        isMainHost = true
      }
    } catch {
      // ignore
    }
  }
  const parts = hostname.split('.')

  let subdomain = ''
  if (isMainHost && parts.length > 1) {
    subdomain = parts[0]
  } else if (!isMainHost && parts.length >= 2) {
    subdomain = parts[0] === 'www' ? '' : parts[0]
  }

  if (subdomain) {
    url.pathname = `/site/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
    // Layout uses x-pathname to show header/footer only in site context
    requestHeaders.set('x-pathname', url.pathname)
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  requestHeaders.set('x-pathname', url.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
