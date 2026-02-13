import { defineArrayMember, defineField, defineType } from 'sanity'
import { sectionStyle } from '../sectionStyle'

export const contentSection = defineType({
  name: 'contentSection',
  title: 'Content (columns)',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Section style',
      type: 'sectionStyle',
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {
              name: 'size',
              type: 'string',
              title: 'Size',
              options: {
                list: [
                  { title: 'One third', value: 'oneThird' },
                  { title: 'Half', value: 'half' },
                  { title: 'Two thirds', value: 'twoThirds' },
                  { title: 'Full', value: 'full' },
                ],
              },
            },
            {
              name: 'richText',
              title: 'Content',
              type: 'array',
              of: [{ type: 'block' }],
            },
            { name: 'enableLink', type: 'boolean', title: 'Enable link', initialValue: false },
            { name: 'linkLabel', type: 'string', title: 'Link label', hidden: ({ parent }) => !parent?.enableLink },
            { name: 'linkHref', type: 'string', title: 'Link URL', hidden: ({ parent }) => !parent?.enableLink },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { columns: 'columns' },
    prepare({ columns }) {
      return { title: 'Content', subtitle: `${columns?.length ?? 0} column(s)` }
    },
  },
})
