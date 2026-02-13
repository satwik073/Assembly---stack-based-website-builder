import { defineField, defineType } from 'sanity'

/** Reusable block/section style (background, padding, width). */
export const sectionStyle = defineType({
  name: 'sectionStyle',
  title: 'Section style',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'backgroundColor',
      title: 'Background',
      type: 'string',
      initialValue: 'default',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Muted', value: 'muted' },
          { title: 'Primary', value: 'primary' },
          { title: 'Dark', value: 'dark' },
        ],
      },
    }),
    defineField({
      name: 'paddingY',
      title: 'Vertical padding',
      type: 'string',
      initialValue: 'medium',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Small', value: 'small' },
          { title: 'Medium', value: 'medium' },
          { title: 'Large', value: 'large' },
        ],
      },
    }),
    defineField({
      name: 'maxWidth',
      title: 'Content width',
      type: 'string',
      initialValue: 'full',
      options: {
        list: [
          { title: 'Full', value: 'full' },
          { title: 'Narrow', value: 'narrow' },
          { title: 'Wide', value: 'wide' },
        ],
      },
    }),
  ],
})
