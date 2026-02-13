import React from 'react'

interface Props {
  className?: string
}

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Studio'

export const Icon = (props: Props) => {
  const { className } = props

  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.9" />
      <path
        d="M8 16h16M16 8v16"
        stroke="var(--theme-elevation-0, #fff)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Icon
