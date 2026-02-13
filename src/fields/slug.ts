import type { Field } from 'payload'

/**
 * Plain slug field with auto-generate from title.
 * so it never triggers useServerFunctions / ServerFunctionsProvider.
 * Use this when the admin layout has provider issues with SlugField.
 */
export function customSlugField(options?: { fieldName?: string; admin?: { description?: string } }): Field {
  const name = options?.fieldName ?? 'slug'
  return {
    name,
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      description: options?.admin?.description ?? 'URL-friendly version of the title. Auto-generated on save if left empty.',
    },
    hooks: {
      beforeValidate: [
        ({ data, operation, value }) => {
          if (value && typeof value === 'string' && value.trim() !== '') return value
          const title = data?.title
          if (typeof title === 'string' && title.trim() !== '') {
            return title
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '') || 'untitled'
          }
          return value
        },
      ],
    },
  }
}
