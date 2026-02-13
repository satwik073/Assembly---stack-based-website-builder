import { defineArrayMember, defineField, defineType } from 'sanity'
import { sectionTypes } from './sections'

/** Page built in Content Studio (Presentation drag-and-drop). Renders on frontend; media/forms can come from the CMS. */
export const pageBuilder = defineType({
  name: 'pageBuilder',
  title: 'Page (Builder)',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'content',
      fields: [
        { name: 'type', type: 'string', title: 'Type', options: { list: ['default', 'minimal'] }, initialValue: 'default' },
        { name: 'richText', type: 'array', of: [{ type: 'block' }], title: 'Content' },
        {
          name: 'media',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
        {
          name: 'payloadMediaUrl',
          type: 'url',
          title: 'Or CMS media URL',
          description: 'Use an image from the media library',
        },
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      of: sectionTypes.map((t) => ({ type: t.name })),
      description: 'Drag to reorder. Edit in Presentation for visual drag-and-drop.',
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return { title: title || 'Untitled', subtitle: slug ? `/${slug}` : '' }
    },
  },
})
