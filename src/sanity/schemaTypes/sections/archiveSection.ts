import { defineField, defineType } from 'sanity'
import { sectionStyle } from '../sectionStyle'

export const archiveSection = defineType({
  name: 'archiveSection',
  title: 'Archive (posts list)',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Section style',
      type: 'sectionStyle',
    }),
    defineField({
      name: 'introContent',
      title: 'Intro content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'limit',
      title: 'Limit',
      type: 'number',
      initialValue: 10,
    }),
  ],
  preview: {
    select: { limit: 'limit' },
    prepare({ limit }) {
      return { title: 'Archive', subtitle: `Show up to ${limit ?? 10} posts` }
    },
  },
})
