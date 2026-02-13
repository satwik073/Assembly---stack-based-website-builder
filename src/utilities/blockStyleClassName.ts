import { cn } from '@/utilities/ui'

export type BlockStyle = {
  backgroundColor?: 'default' | 'muted' | 'primary' | 'dark' | null
  paddingY?: 'none' | 'small' | 'medium' | 'large' | null
  maxWidth?: 'full' | 'narrow' | 'wide' | null
} | null
  | undefined

const bgClass: Record<NonNullable<BlockStyle>['backgroundColor'] & string, string> = {
  default: '',
  muted: 'bg-muted',
  primary: 'bg-primary text-primary-foreground',
  dark: 'bg-neutral-900 text-white dark:bg-neutral-950',
}

const paddingYClass: Record<NonNullable<BlockStyle>['paddingY'] & string, string> = {
  none: 'py-0',
  small: 'py-8',
  medium: 'py-12',
  large: 'py-16',
}

const maxWidthClass: Record<NonNullable<BlockStyle>['maxWidth'] & string, string> = {
  full: 'max-w-none',
  narrow: 'max-w-2xl mx-auto',
  wide: 'max-w-5xl mx-auto',
}

/**
 * Builds Tailwind class names from a block's style group (from Payload block style fields).
 */
export function getBlockStyleClassName(style: BlockStyle, existingClassName?: string): string {
  if (!style) return cn('my-16', existingClassName)

  const bg = style.backgroundColor && bgClass[style.backgroundColor] ? bgClass[style.backgroundColor] : ''
  const py = style.paddingY && paddingYClass[style.paddingY] ? paddingYClass[style.paddingY] : 'py-12'
  const width = style.maxWidth && maxWidthClass[style.maxWidth] ? maxWidthClass[style.maxWidth] : ''

  return cn('my-16', py, bg, width, existingClassName)
}
