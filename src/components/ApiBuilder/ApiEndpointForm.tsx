'use client'

import React, { useState, useCallback } from 'react'
import type { ParsedCurl } from '@/utilities/parseCurl'
import { parseCurl } from '@/utilities/parseCurl'

interface KeyValuePair {
  key: string
  value: string
}

interface EndpointConfig {
  name: string
  method: string
  url: string
  headers: KeyValuePair[]
  authType: string
  authConfig: Record<string, string>
  queryParams: KeyValuePair[]
  requestBody: string
}

interface ApiEndpointFormProps {
  initial_config?: Partial<EndpointConfig>
  on_submit: (config: EndpointConfig) => void
  on_test: (config: EndpointConfig) => void
  is_loading?: boolean
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
}

function KeyValueEditor({
  items,
  on_change,
  label,
}: {
  items: KeyValuePair[]
  on_change: (items: KeyValuePair[]) => void
  label: string
}) {
  const add_pair = () => on_change([...items, { key: '', value: '' }])
  const remove_pair = (idx: number) => on_change(items.filter((_, i) => i !== idx))
  const update_pair = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = items.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    on_change(updated)
  }

  return (
    <div className="kv-editor">
      <div className="kv-editor__header">
        <span className="kv-editor__label">{label}</span>
        <button type="button" onClick={add_pair} className="kv-editor__add">
          + Add
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="kv-editor__row">
          <input
            type="text"
            placeholder="Key"
            value={item.key}
            onChange={(e) => update_pair(idx, 'key', e.target.value)}
            className="kv-editor__input"
          />
          <input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => update_pair(idx, 'value', e.target.value)}
            className="kv-editor__input"
          />
          <button type="button" onClick={() => remove_pair(idx)} className="kv-editor__remove">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function ApiEndpointForm({
  initial_config,
  on_submit,
  on_test,
  is_loading,
}: ApiEndpointFormProps) {
  const [name, set_name] = useState(initial_config?.name ?? '')
  const [method, set_method] = useState(initial_config?.method ?? 'GET')
  const [url, set_url] = useState(initial_config?.url ?? '')
  const [headers, set_headers] = useState<KeyValuePair[]>(initial_config?.headers ?? [])
  const [auth_type, set_auth_type] = useState(initial_config?.authType ?? 'none')
  const [auth_config, set_auth_config] = useState<Record<string, string>>(
    initial_config?.authConfig ?? {},
  )
  const [query_params, set_query_params] = useState<KeyValuePair[]>(
    initial_config?.queryParams ?? [],
  )
  const [request_body, set_request_body] = useState(initial_config?.requestBody ?? '')
  const [curl_input, set_curl_input] = useState('')
  const [show_curl_modal, set_show_curl_modal] = useState(false)
  const [active_tab, set_active_tab] = useState<'params' | 'headers' | 'auth' | 'body'>('params')

  const build_config = useCallback(
    (): EndpointConfig => ({
      name,
      method,
      url,
      headers,
      authType: auth_type,
      authConfig: auth_config,
      queryParams: query_params,
      requestBody: request_body,
    }),
    [name, method, url, headers, auth_type, auth_config, query_params, request_body],
  )

  const handle_curl_import = useCallback(async () => {
    if (!curl_input.trim()) return
    try {
      const parsed: ParsedCurl = await parseCurl(curl_input)
      set_method(parsed.method)
      set_url(parsed.url)
      set_headers(parsed.headers)
      set_auth_type(parsed.authType)
      set_auth_config(parsed.authConfig)
      set_query_params(parsed.queryParams)
      if (parsed.body) set_request_body(parsed.body)
      set_show_curl_modal(false)
      set_curl_input('')
    } catch (e) {
      console.error('Failed to parse curl', e)
    }
  }, [curl_input])

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault()
    on_submit(build_config())
  }

  const handle_test = () => {
    on_test(build_config())
  }

  return (
    <form onSubmit={handle_submit} className="api-form">
      <div className="api-form__top-bar">
        <input
          type="text"
          placeholder="Endpoint name (e.g. Get Products)"
          value={name}
          onChange={(e) => set_name(e.target.value)}
          className="api-form__name-input"
        />
        <button
          type="button"
          onClick={() => set_show_curl_modal(true)}
          className="api-form__curl-btn"
        >
          Import cURL
        </button>
      </div>

      <div className="api-form__url-bar">
        <select
          value={method}
          onChange={(e) => set_method(e.target.value)}
          className="api-form__method-select"
          style={{ color: METHOD_COLORS[method] ?? '#fff' }}
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="https://api.example.com/v1/products"
          value={url}
          onChange={(e) => set_url(e.target.value)}
          className="api-form__url-input"
        />
        <button
          type="button"
          onClick={handle_test}
          disabled={is_loading || !url}
          className="api-form__send-btn"
        >
          {is_loading ? <span className="api-form__spinner" /> : '▶ Send'}
        </button>
      </div>

      <div className="api-form__tabs">
        {(['params', 'headers', 'auth', 'body'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`api-form__tab ${active_tab === tab ? 'api-form__tab--active' : ''}`}
            onClick={() => set_active_tab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'params' && query_params.length > 0 && (
              <span className="api-form__badge">{query_params.length}</span>
            )}
            {tab === 'headers' && headers.length > 0 && (
              <span className="api-form__badge">{headers.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="api-form__tab-content">
        {active_tab === 'params' && (
          <KeyValueEditor
            items={query_params}
            on_change={set_query_params}
            label="Query Parameters"
          />
        )}

        {active_tab === 'headers' && (
          <KeyValueEditor items={headers} on_change={set_headers} label="Request Headers" />
        )}

        {active_tab === 'auth' && (
          <div className="api-form__auth">
            <select
              value={auth_type}
              onChange={(e) => set_auth_type(e.target.value)}
              className="api-form__auth-select"
            >
              <option value="none">No Authentication</option>
              <option value="bearer">Bearer Token</option>
              <option value="api-key">API Key</option>
              <option value="basic">Basic Auth</option>
            </select>

            {auth_type === 'bearer' && (
              <input
                type="text"
                placeholder="Enter bearer token"
                value={auth_config.bearerToken ?? ''}
                onChange={(e) => set_auth_config({ ...auth_config, bearerToken: e.target.value })}
                className="api-form__auth-input"
              />
            )}

            {auth_type === 'api-key' && (
              <div className="api-form__auth-group">
                <input
                  type="text"
                  placeholder="Header name (e.g. X-API-Key)"
                  value={auth_config.apiKeyName ?? ''}
                  onChange={(e) => set_auth_config({ ...auth_config, apiKeyName: e.target.value })}
                  className="api-form__auth-input"
                />
                <input
                  type="text"
                  placeholder="API key value"
                  value={auth_config.apiKeyValue ?? ''}
                  onChange={(e) => set_auth_config({ ...auth_config, apiKeyValue: e.target.value })}
                  className="api-form__auth-input"
                />
              </div>
            )}

            {auth_type === 'basic' && (
              <div className="api-form__auth-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={auth_config.basicUsername ?? ''}
                  onChange={(e) =>
                    set_auth_config({ ...auth_config, basicUsername: e.target.value })
                  }
                  className="api-form__auth-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={auth_config.basicPassword ?? ''}
                  onChange={(e) =>
                    set_auth_config({ ...auth_config, basicPassword: e.target.value })
                  }
                  className="api-form__auth-input"
                />
              </div>
            )}
          </div>
        )}

        {active_tab === 'body' && (
          <div className="api-form__body">
            <textarea
              placeholder='{\n  "key": "value"\n}'
              value={request_body}
              onChange={(e) => set_request_body(e.target.value)}
              className="api-form__body-textarea"
              rows={8}
            />
          </div>
        )}
      </div>

      <div className="api-form__actions">
        <button type="submit" className="api-form__save-btn" disabled={!name || !url}>
          💾 Save Endpoint
        </button>
      </div>

      {show_curl_modal && (
        <div className="curl-modal__overlay" onClick={() => set_show_curl_modal(false)}>
          <div className="curl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="curl-modal__header">
              <h3>Import cURL Command</h3>
              <button onClick={() => set_show_curl_modal(false)} className="curl-modal__close">
                ×
              </button>
            </div>
            <textarea
              placeholder={
                'Paste your curl command here...\n\ncurl -X GET "https://api.example.com/data" \\\n  -H "Authorization: Bearer token123" \\\n  -H "Content-Type: application/json"'
              }
              value={curl_input}
              onChange={(e) => set_curl_input(e.target.value)}
              className="curl-modal__textarea"
              rows={10}
            />
            <div className="curl-modal__actions">
              <button
                type="button"
                onClick={handle_curl_import}
                className="curl-modal__import-btn"
                disabled={!curl_input.trim()}
              >
                Import & Fill Form
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
