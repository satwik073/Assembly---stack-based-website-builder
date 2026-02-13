import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

type HeaderProps = {
  /** When set, use this instead of global (e.g. site-specific header). */
  data?: Header | null
  /** Base path for logo link when in site context (e.g. /site/mysite). */
  basePath?: string
}

export async function Header(props: HeaderProps) {
  const headerData: Header = props.data ?? (await getCachedGlobal('header', 1)())

  return <HeaderClient data={headerData} basePath={props.basePath} />
}
