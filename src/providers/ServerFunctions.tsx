'use client'

import { ServerFunctionsProvider } from '@payloadcms/ui'
import React from 'react'

/**
 * No-op server function for the frontend. Prevents "useServerFunctions must be used
 * within a ServerFunctionsProvider" when components that import from @payloadcms/ui
 * (e.g. CopyIcon in Code block) are rendered on the frontend.
 */
const noopServerFunction = async (_args: { name: string; args: Record<string, unknown> }) => {
  return null
}

export const FrontendServerFunctionsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ServerFunctionsProvider serverFunction={noopServerFunction}>
      {children}
    </ServerFunctionsProvider>
  )
}
