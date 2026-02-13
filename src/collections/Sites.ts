import type { CollectionConfig } from 'payload'

import { link } from '@/fields/link'

export const Sites: CollectionConfig = {
  slug: 'sites',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subdomain', 'owner'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'subdomain',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used for yoursite.platform.com',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      admin: {
        description: 'Shown only when visiting this site (subdomain).',
      },
    },
    {
      name: 'redirects',
      type: 'group',
      label: 'Redirects',
      fields: [
        {
          name: 'redirects',
          type: 'array',
          label: 'Redirects',
          fields: [
            {
              name: 'from',
              type: 'text',
              label: 'From',
            },
            {
              name: 'to',
              type: 'text',
              label: 'To',
            },
          ],
        },
      ],
    },
    {
      name: 'headerNavItems',
      type: 'array',
      label: 'Header nav items',
      admin: {
        description: 'Shown only when visiting this site (subdomain).',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'footerNavItems',
      type: 'array',
      label: 'Footer nav items',
      admin: {
        description: 'Shown only when visiting this site (subdomain).',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
