import type { Block } from 'payload'

import { blockStyleFields } from '../../fields/blockStyle'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    ...blockStyleFields,
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
