import { defineField, defineType } from 'sanity'
import { sectionStyle } from '../sectionStyle'

export const mediaSection = defineType({
  name: 'mediaSection',
  title: 'Media',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Section style',
      type: 'sectionStyle',
    }),
    defineField({
      name: 'media',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'payloadMediaUrl',
      title: 'Or use media library URL',
      type: 'url',
      description: 'Paste URL from the media library (e.g. /api/media/file/...) to use existing uploads',
    }),
  ],
  preview: {
    select: { media: 'media' },
    prepare({ media }) {
      return { title: 'Media', media }
    },
  },
})
