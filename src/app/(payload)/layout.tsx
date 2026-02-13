/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config, { configPromise } from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { ServerFunctionsProvider } from '@payloadcms/ui'
import React from 'react'

import { importMap } from './admin/importMap.js'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

// 1) Outer ServerFunctionsProvider wraps RootLayout (and its #portal) so drawers/modals have context.
// 2) Inner ServerFunctionsProvider wraps children so full-page edit view has context (avoids provider tree gaps).
const Layout = ({ children }: Args) => (
  <ServerFunctionsProvider serverFunction={serverFunction}>
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      <ServerFunctionsProvider serverFunction={serverFunction}>
        {children}
      </ServerFunctionsProvider>
    </RootLayout>
  </ServerFunctionsProvider>
)

export default Layout
