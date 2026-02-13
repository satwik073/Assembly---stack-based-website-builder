import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Enables Next.js draft mode for Sanity Presentation tool.
 * Sanity Studio calls this when opening the preview iframe.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const redirectTo = searchParams.get('redirect') ?? '/'
  const secret = searchParams.get('secret')
  const sanitySecret = process.env.SANITY_PREVIEW_SECRET

  if (sanitySecret && secret !== sanitySecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(redirectTo, req.url))
}
