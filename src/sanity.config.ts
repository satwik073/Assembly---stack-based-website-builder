import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schemaTypes } from './sanity/schemaTypes'
import { dataset, projectId } from './sanity/env'
import { locations, mainDocuments } from './sanity/presentation/resolve'

export default defineConfig({
  name: 'web-builder',
  title: 'Web Builder – Sanity',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      resolve: { locations, mainDocuments },
      previewUrl: {
        initial: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      allowOrigins: ['http://localhost:*', 'http://127.0.0.1:*'],
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
