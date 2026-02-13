import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/** Only create client when Sanity is configured (NEXT_PUBLIC_SANITY_PROJECT_ID set). */
export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null
