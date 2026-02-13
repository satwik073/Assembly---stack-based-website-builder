import React from 'react'
import { PortableText } from '@/components/Sanity/PortableText'
import { getBlockStyleClassName } from '@/utilities/blockStyleClassName'
import type { BlockStyle } from '@/utilities/blockStyleClassName'
import { FormBlock } from '@/blocks/Form/Component'
import { getPayload } from 'payload'
import { configPromise } from '@payload-config'

type FormSectionProps = {
  style?: BlockStyle
  formSlug?: string | null
  enableIntro?: boolean
  introContent?: unknown[]
}

/**
 * Renders intro from Sanity; form is loaded from Payload by formSlug.
 */
export async function FormSection({ style, formSlug, enableIntro, introContent }: FormSectionProps) {
  let formBlock: React.ReactNode = (
    <p className="text-muted-foreground">Set a form slug in Sanity (Payload admin → Forms).</p>
  )
  if (formSlug) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'forms',
      where: { slug: { equals: formSlug } },
      limit: 1,
    })
    const form = result.docs[0]
    if (form) {
      formBlock = <FormBlock form={form} blockType="formBlock" />
    } else {
      formBlock = (
        <p className="text-muted-foreground">
          Form &quot;{formSlug}&quot; not found in Payload. Create it in admin → Forms.
        </p>
      )
    }
  }

  return (
    <div className={getBlockStyleClassName(style)}>
      <div className="container">
        {enableIntro && introContent?.length ? (
          <div className="mb-8">
            <PortableText value={introContent as never} />
          </div>
        ) : null}
        {formBlock}
      </div>
    </div>
  )
}
