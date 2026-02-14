import type { CollectionConfig } from 'payload'

export const ApiEndpoints: CollectionConfig = {
  slug: 'api-endpoints',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'method', 'url', 'page'],
    components: {
      beforeListTable: ['@/components/ApiBuilder/CurlImportAdmin'],
    },
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'A friendly name for this API endpoint',
      },
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: false,
      hasMany: false,
      admin: {
        description: 'The page this API endpoint is associated with (can be assigned later)',
      },
    },
    {
      name: 'method',
      type: 'select',
      required: true,
      defaultValue: 'GET',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Full API endpoint URL (e.g. https://api.example.com/v1/products)',
      },
    },
    {
      name: 'headers',
      type: 'array',
      label: 'Request Headers',
      admin: {
        description: 'Custom HTTP headers to send with the request',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          admin: { width: '45%' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { width: '45%' },
        },
      ],
    },
    {
      name: 'authType',
      type: 'select',
      label: 'Authentication Type',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Bearer Token', value: 'bearer' },
        { label: 'API Key', value: 'api-key' },
        { label: 'Basic Auth', value: 'basic' },
      ],
    },
    {
      name: 'authConfig',
      type: 'group',
      label: 'Authentication Configuration',
      admin: {
        condition: (data) => data?.authType && data.authType !== 'none',
      },
      fields: [
        {
          name: 'bearerToken',
          type: 'text',
          admin: {
            condition: (data) => data?.authType === 'bearer',
            description: 'Bearer token (without "Bearer " prefix)',
          },
        },
        {
          name: 'apiKeyName',
          type: 'text',
          admin: {
            condition: (data) => data?.authType === 'api-key',
            description: 'Header name for the API key (e.g. X-API-Key)',
          },
        },
        {
          name: 'apiKeyValue',
          type: 'text',
          admin: {
            condition: (data) => data?.authType === 'api-key',
            description: 'API key value',
          },
        },
        {
          name: 'basicUsername',
          type: 'text',
          admin: {
            condition: (data) => data?.authType === 'basic',
          },
        },
        {
          name: 'basicPassword',
          type: 'text',
          admin: {
            condition: (data) => data?.authType === 'basic',
          },
        },
      ],
    },
    {
      name: 'queryParams',
      type: 'array',
      label: 'Query Parameters',
      admin: {
        description: 'URL query parameters',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          admin: { width: '45%' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { width: '45%' },
        },
      ],
    },
    {
      name: 'requestBody',
      type: 'textarea',
      label: 'Request Body (JSON)',
      admin: {
        description: 'JSON body for POST/PUT/PATCH requests',
        condition: (data) => ['POST', 'PUT', 'PATCH'].includes(data?.method),
      },
    },
    {
      name: 'dataPath',
      type: 'text',
      label: 'Data Path',
      admin: {
        description:
          'JSONPath to the iterable data in the response (e.g. "data.products" or "results")',
      },
    },
    {
      name: 'responseSchema',
      type: 'json',
      label: 'Response Schema',
      admin: {
        description: 'Auto-detected schema from the last successful response',
        readOnly: true,
      },
    },
    {
      name: 'lastResponse',
      type: 'json',
      label: 'Last Response',
      admin: {
        description: 'Cached last successful API response',
        readOnly: true,
      },
    },
    {
      name: 'cardTemplate',
      type: 'json',
      label: 'Card Template',
      admin: {
        description: 'UI template mapping for rendering data items',
        components: {
          Field: '@/components/ApiBuilder/TemplateBuilderField',
        },
      },
    },
  ],
}
