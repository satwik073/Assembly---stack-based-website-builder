import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Disables Next.js draft mode (used when leaving Sanity Presentation preview).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const redirectTo = searchParams.get('redirect') ?? '/'

  const draft = await draftMode()
  draft.disable()

  return NextResponse.redirect(new URL(redirectTo, req.url))
}
