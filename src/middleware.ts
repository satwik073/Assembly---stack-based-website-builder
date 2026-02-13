import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAIN_HOSTS = ['localhost', '127.0.0.1']

function getMainHostnames(): string[] {
  const hosts = [...MAIN_HOSTS]

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    hosts.push(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  }

  if (process.env.VERCEL_URL) {
    hosts.push(process.env.VERCEL_URL)
  }

  for (const envVar of [process.env.NEXT_PUBLIC_SERVER_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (envVar) {
      try {
        hosts.push(new URL(envVar).hostname)
      } catch {
        // ignore
      }
    }
  }

  return hosts
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]

  const requestHeaders = new Headers(request.headers)

  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/next')
  ) {
    requestHeaders.set('x-pathname', url.pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const mainHostnames = getMainHostnames()
  const isMainHost = mainHostnames.some((h) => hostname === h)

  let subdomain = ''

  if (!isMainHost) {
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      subdomain = parts[0] === 'www' ? '' : parts[0]
    }
  }

  if (subdomain) {
    url.pathname = `/site/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
    requestHeaders.set('x-pathname', url.pathname)
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  requestHeaders.set('x-pathname', url.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
