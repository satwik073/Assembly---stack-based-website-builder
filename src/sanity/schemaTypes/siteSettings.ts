import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      description: 'Links to the Sites collection in the CMS',
    }),
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
    }),
  ],
})
