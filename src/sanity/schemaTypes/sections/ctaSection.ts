import { defineArrayMember, defineField, defineType } from 'sanity'
import { sectionStyle } from '../sectionStyle'

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to Action',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Section style',
      type: 'sectionStyle',
    }),
    defineField({
      name: 'richText',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label' },
            { name: 'href', type: 'string', title: 'URL' },
            {
              name: 'appearance',
              type: 'string',
              title: 'Appearance',
              options: { list: ['default', 'outline'] },
            },
          ],
        }),
      ],
      validation: (Rule) => Rule.max(2),
    }),
  ],
  preview: {
    select: { richText: 'richText' },
    prepare({ richText }) {
      const block = richText?.find((b: { _type: string }) => b._type === 'block')
      const text = block?.children?.find((c: { _type: string }) => c._type === 'span')?.text
      return { title: 'Call to Action', subtitle: text || 'CTA section' }
    },
  },
})
