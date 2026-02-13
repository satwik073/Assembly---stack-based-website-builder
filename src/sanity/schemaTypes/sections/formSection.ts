import { defineField, defineType } from 'sanity'
import { sectionStyle } from '../sectionStyle'

export const formSection = defineType({
  name: 'formSection',
  title: 'Form',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Section style',
      type: 'sectionStyle',
    }),
    defineField({
      name: 'formSlug',
      title: 'Form slug',
      type: 'string',
      description: 'Slug of the form in Admin (Control Panel → Forms). Form is rendered from the CMS.',
    }),
    defineField({
      name: 'enableIntro',
      title: 'Show intro content',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'introContent',
      title: 'Intro content',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: ({ parent }) => !parent?.enableIntro,
    }),
  ],
  preview: {
    select: { formSlug: 'formSlug' },
    prepare({ formSlug }) {
      return { title: 'Form', subtitle: formSlug || 'Set form slug in Admin' }
    },
  },
})
