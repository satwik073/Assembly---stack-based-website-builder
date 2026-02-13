import type { Field } from 'payload'

/**
 * Reusable "Block style" group for page builder blocks.
 * Add to any block config so editors can control background, padding, and width per block.
 */
export const blockStyleFields: Field[] = [
  {
    type: 'group',
    name: 'style',
    label: 'Block style',
    admin: {
      description: 'Optional styling for this block (background, spacing, width).',
    },
    fields: [
      {
        name: 'backgroundColor',
        type: 'select',
        label: 'Background',
        defaultValue: 'default',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Muted', value: 'muted' },
          { label: 'Primary', value: 'primary' },
          { label: 'Dark', value: 'dark' },
        ],
      },
      {
        name: 'paddingY',
        type: 'select',
        label: 'Vertical padding',
        defaultValue: 'medium',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
      },
      {
        name: 'maxWidth',
        type: 'select',
        label: 'Content width',
        defaultValue: 'full',
        options: [
          { label: 'Full', value: 'full' },
          { label: 'Narrow', value: 'narrow' },
          { label: 'Wide', value: 'wide' },
        ],
      },
    ],
  },
]
