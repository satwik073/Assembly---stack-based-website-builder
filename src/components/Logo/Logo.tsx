import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Home'

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span
      className={clsx('font-semibold text-lg', className)}
      aria-label={siteName}
    >
      {siteName}
    </span>
  )
}

export default Logo
