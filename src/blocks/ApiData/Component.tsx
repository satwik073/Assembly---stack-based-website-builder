'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { getValueAtPath } from '@/utilities/schemaAnalyzer'

interface FieldMapping {
  id: string
  element_type: 'image' | 'heading' | 'text' | 'badge' | 'link' | 'price'
  field_path: string
  label: string
}

interface ApiEndpointData {
  url: string
  method: string
  headers?: Array<{ key: string; value: string }>
  authType?: string
  authConfig?: Record<string, string>
  queryParams?: Array<{ key: string; value: string }>
  requestBody?: string
  dataPath?: string
  cardTemplate?: {
    mappings: FieldMapping[]
    grid_columns: number
    card_style: string
  }
}

interface ApiDataBlockProps {
  apiEndpoint: string | ApiEndpointData
  dataPath?: string
  gridColumns?: string
  cardStyle?: string
  emptyStateText?: string
  showLoadMore?: boolean
}

function renderElement(mapping: FieldMapping, item: Record<string, unknown>) {
  const value = getValueAtPath(item, mapping.field_path)
  const str_value = value !== null && value !== undefined ? String(value) : ''

  switch (mapping.element_type) {
    case 'image':
      return (
        <div className="api-card__image-wrap">
          {str_value ? (
            <img src={str_value} alt="" className="api-card__image" loading="lazy" />
          ) : (
            <div className="api-card__image-placeholder">No Image</div>
          )}
        </div>
      )
    case 'heading':
      return <h3 className="api-card__heading">{str_value || 'Untitled'}</h3>
    case 'text':
      return (
        <p className="api-card__text">
          {str_value.length > 200 ? str_value.substring(0, 200) + '…' : str_value}
        </p>
      )
    case 'badge':
      return <span className="api-card__badge">{str_value}</span>
    case 'link':
      return (
        <a
          href={str_value || '#'}
          className="api-card__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {mapping.label} →
        </a>
      )
    case 'price':
      return <span className="api-card__price">{str_value ? `$${str_value}` : '$0.00'}</span>
    default:
      return <span>{str_value}</span>
  }
}

export function ApiDataBlock({
  apiEndpoint,
  dataPath: data_path_override,
  gridColumns = '3',
  cardStyle = 'elevated',
  emptyStateText = 'No data available',
  showLoadMore = false,
}: ApiDataBlockProps) {
  const [items, set_items] = useState<Record<string, unknown>[]>([])
  const [is_loading, set_is_loading] = useState(true)
  const [error_message, set_error_message] = useState<string | null>(null)
  const [endpoint_config, set_endpoint_config] = useState<ApiEndpointData | null>(null)
  const [visible_count, set_visible_count] = useState(12)

  useEffect(() => {
    async function loadEndpoint() {
      if (typeof apiEndpoint === 'object') {
        set_endpoint_config(apiEndpoint)
        return
      }

      try {
        const res = await fetch(`/api/api-endpoints/${apiEndpoint}?depth=0`)
        if (res.ok) {
          const data = await res.json()
          set_endpoint_config(data)
        } else {
          set_error_message('Failed to load API endpoint configuration')
        }
      } catch {
        set_error_message('Failed to load API endpoint configuration')
      }
    }

    loadEndpoint()
  }, [apiEndpoint])

  useEffect(() => {
    if (!endpoint_config) return

    async function fetchData() {
      set_is_loading(true)
      set_error_message(null)
      try {
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: endpoint_config!.method,
            url: endpoint_config!.url,
            headers: endpoint_config!.headers ?? [],
            authType: endpoint_config!.authType ?? 'none',
            authConfig: endpoint_config!.authConfig ?? {},
            queryParams: endpoint_config!.queryParams ?? [],
            body: endpoint_config!.requestBody,
          }),
        })

        const result = await res.json()

        if (!result.success) {
          set_error_message(result.error ?? 'API request failed')
          return
        }

        const path = data_path_override || endpoint_config!.dataPath || ''
        const data_at_path = path ? getValueAtPath(result.data, path) : result.data

        if (Array.isArray(data_at_path)) {
          set_items(data_at_path as Record<string, unknown>[])
        } else if (typeof data_at_path === 'object' && data_at_path !== null) {
          set_items([data_at_path as Record<string, unknown>])
        } else {
          set_items([])
        }
      } catch (err) {
        set_error_message(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        set_is_loading(false)
      }
    }

    fetchData()
  }, [endpoint_config, data_path_override])

  const card_template = endpoint_config?.cardTemplate
  const mappings = card_template?.mappings ?? []
  const columns = parseInt(gridColumns, 10) || card_template?.grid_columns || 3
  const style = cardStyle || card_template?.card_style || 'elevated'

  const visible_items = useMemo(() => {
    return showLoadMore ? items.slice(0, visible_count) : items
  }, [items, visible_count, showLoadMore])

  if (is_loading) {
    return (
      <div className="api-block api-block--loading">
        <div className="api-block__loader">
          <div className="api-block__spinner" />
          <span>Loading data...</span>
        </div>
      </div>
    )
  }

  if (error_message) {
    return (
      <div className="api-block api-block--error">
        <div className="api-block__error-content">
          <span className="api-block__error-icon">⚠️</span>
          <span>{error_message}</span>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="api-block api-block--empty">
        <p>{emptyStateText}</p>
      </div>
    )
  }

  if (mappings.length === 0) {
    return (
      <div className="api-block">
        <div className="api-block__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {visible_items.map((item, idx) => (
            <div key={idx} className={`api-card api-card--${style}`}>
              {Object.entries(item)
                .slice(0, 6)
                .map(([key, value]) => (
                  <div key={key} className="api-card__auto-field">
                    <span className="api-card__auto-label">{key}</span>
                    <span className="api-card__auto-value">
                      {typeof value === 'string' &&
                      (value.startsWith('http://') || value.startsWith('https://')) ? (
                        value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) ? (
                          <img
                            src={value}
                            alt={key}
                            className="api-card__image"
                            loading="lazy"
                            style={{
                              maxHeight: '120px',
                              objectFit: 'cover',
                              width: '100%',
                              borderRadius: '6px',
                            }}
                          />
                        ) : (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#818cf8' }}
                          >
                            {value}
                          </a>
                        )
                      ) : (
                        String(value ?? '')
                      )}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
        {showLoadMore && visible_count < items.length && (
          <div className="api-block__load-more">
            <button
              onClick={() => set_visible_count((c) => c + 12)}
              className="api-block__load-more-btn"
            >
              Load More ({items.length - visible_count} remaining)
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="api-block">
      <div className="api-block__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {visible_items.map((item, idx) => (
          <div key={idx} className={`api-card api-card--${style}`}>
            {mappings.map((mapping) => (
              <div key={mapping.id} className="api-card__element">
                {renderElement(mapping, item)}
              </div>
            ))}
          </div>
        ))}
      </div>
      {showLoadMore && visible_count < items.length && (
        <div className="api-block__load-more">
          <button
            onClick={() => set_visible_count((c) => c + 12)}
            className="api-block__load-more-btn"
          >
            Load More ({items.length - visible_count} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
