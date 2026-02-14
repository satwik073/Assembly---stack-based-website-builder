import type { Block } from 'payload'

export const ApiData: Block = {
  slug: 'apiData',
  labels: {
    singular: 'API Data Block',
    plural: 'API Data Blocks',
  },
  fields: [
    {
      name: 'apiEndpoint',
      type: 'relationship',
      relationTo: 'api-endpoints',
      required: true,
      label: 'API Endpoint',
      admin: {
        description: 'Select a configured API endpoint to fetch data from',
      },
    },
    {
      name: 'dataPath',
      type: 'text',
      label: 'Data Path Override',
      admin: {
        description:
          'Optional: override the data path from the endpoint config (e.g. "data.products")',
      },
    },
    {
      name: 'gridColumns',
      type: 'select',
      label: 'Grid Columns',
      defaultValue: '3',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'cardStyle',
      type: 'select',
      label: 'Card Style',
      defaultValue: 'elevated',
      options: [
        { label: 'Minimal', value: 'minimal' },
        { label: 'Elevated', value: 'elevated' },
        { label: 'Bordered', value: 'bordered' },
        { label: 'Glassmorphic', value: 'glassmorphic' },
      ],
    },
    {
      name: 'emptyStateText',
      type: 'text',
      label: 'Empty State Text',
      defaultValue: 'No data available',
    },
    {
      name: 'showLoadMore',
      type: 'checkbox',
      label: 'Show Load More Button',
      defaultValue: false,
    },
  ],
}
