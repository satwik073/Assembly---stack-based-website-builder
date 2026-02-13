import type { CollectionConfig } from 'payload'

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
  ],
}
