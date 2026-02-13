import React from 'react'

import { FrontendServerFunctionsProvider } from './ServerFunctions'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <FrontendServerFunctionsProvider>
      <ThemeProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </ThemeProvider>
    </FrontendServerFunctionsProvider>
  )
}
