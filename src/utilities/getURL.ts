import { log } from 'console'
import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  )
}



export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }


  console.log(process.env.NEXT_PUBLIC_APP_URL)
  console.log(process.env.NEXT_PUBLIC_SERVER_URL)
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''
}

/** Build redirect URL for a site by subdomain (e.g. http://mysite.localhost:3000) */
export function getSiteOrigin(subdomain: string): string {
  if (!subdomain?.trim()) return getServerSideURL()
  const base = getServerSideURL()
  try {
    const u = new URL(base)
    const host = u.hostname
    const port = u.port || (u.protocol === 'https:' ? '443' : '80')
    const needPort = port !== '443' && port !== '80'
    const hostWithSubdomain = `${subdomain.trim()}.${host}`
    const origin = `${u.protocol}//${hostWithSubdomain}${needPort ? `:${port}` : ''}`
    return origin
  } catch {
    return `http://${subdomain.trim()}.localhost:3000`
  }
}
