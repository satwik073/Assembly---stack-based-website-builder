'use client'

import React, { useMemo } from 'react'
import { TemplateBuilder } from './TemplateBuilder'
import { useField, useFormFields } from '@payloadcms/ui'
import type { Field } from 'payload'

const TemplateBuilderField = (props: { path: string; field: Field }) => {
  const { path } = props
  const { value, setValue } = useField<any>({ path })

  // Access data from sibling fields
  const dataPathValue = useFormFields(([fields]) => fields.dataPath?.value) as string
  const lastResponseValue = useFormFields(([fields]) => fields.lastResponse?.value)

  // Memoize data to prevent unnecessary re-renders
  const responseData = useMemo(() => {
    return lastResponseValue ?? null
  }, [lastResponseValue])

  const dataPath = useMemo(() => {
    return dataPathValue ?? ''
  }, [dataPathValue])

  // Handle template updates
  const handleTemplateChange = (newTemplate: any) => {
    setValue(newTemplate)
  }

  // If we don't have response data, show a message
  if (!responseData && !dataPath) {
    return (
      <div
        style={{
          padding: '24px',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          background: '#f9f9f9',
          color: '#666',
        }}
      >
        To use the Template Builder, please save the endpoint and ensure you have run a request to
        capture a Last Response.
      </div>
    )
  }

  return (
    <div className="template-builder-field">
      <label className="field-label">Card Template</label>
      <div style={{ marginTop: '12px' }}>
        <TemplateBuilder
          response_data={responseData}
          data_path={dataPath}
          initial_template={value}
          on_template_change={handleTemplateChange}
        />
      </div>
    </div>
  )
}

export default TemplateBuilderField
