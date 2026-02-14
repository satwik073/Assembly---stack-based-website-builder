'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation.js'
import { parseCurl } from '@/utilities/parseCurl'

type InputMode = 'form' | 'import'
type ActiveTab = 'headers' | 'auth' | 'body' | 'params'

interface EndpointState {
  name: string
  method: string
  url: string
  headers: Array<{ key: string; value: string }>
  authType: string
  authConfig: Record<string, string>
  queryParams: Array<{ key: string; value: string }>
  requestBody: string
}

interface ApiResponse {
  success: boolean
  status: number
  statusText: string
  data: unknown
  elapsed_ms: number
}

const INITIAL_STATE: EndpointState = {
  name: '',
  method: 'GET',
  url: '',
  headers: [],
  authType: 'none',
  authConfig: {},
  queryParams: [],
  requestBody: '',
}

export const CurlImportAdmin: React.FC = () => {
  const [mode, set_mode] = useState<InputMode>('form')
  const [curl_text, set_curl_text] = useState('')
  const [endpoint, set_endpoint] = useState<EndpointState>({ ...INITIAL_STATE })
  const [response, set_response] = useState<ApiResponse | null>(null)
  const [is_testing, set_is_testing] = useState(false)
  const [is_saving, set_is_saving] = useState(false)
  const [active_tab, set_active_tab] = useState<ActiveTab>('headers')
  const [result_msg, set_result_msg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const router = useRouter()

  const handle_import = useCallback(async () => {
    if (!curl_text.trim()) return
    try {
      const parsed = await parseCurl(curl_text)
      const name_from_url = (() => {
        try {
          return new URL(parsed.url).pathname.split('/').filter(Boolean).pop() || 'Imported'
        } catch {
          return 'Imported'
        }
      })()

      set_endpoint({
        name: name_from_url,
        method: parsed.method,
        url: parsed.url,
        headers: parsed.headers,
        authType: parsed.authType,
        authConfig: parsed.authConfig as Record<string, string>,
        queryParams: parsed.queryParams,
        requestBody: parsed.body,
      })
      set_mode('form')
      set_result_msg({
        type: 'success',
        text: `Parsed as ${parsed.detectedFormat.toUpperCase()} → ${parsed.method} ${parsed.url.substring(0, 60)}...`,
      })
      setTimeout(() => set_result_msg(null), 4000)
    } catch (err) {
      console.error('Parse error:', err)
      set_result_msg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to parse',
      })
    }
  }, [curl_text])

  const handle_test = useCallback(async () => {
    if (!endpoint.url) return
    set_is_testing(true)
    set_response(null)
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: endpoint.method,
          url: endpoint.url,
          headers: endpoint.headers,
          authType: endpoint.authType,
          authConfig: endpoint.authConfig,
          queryParams: endpoint.queryParams,
          body: endpoint.requestBody,
        }),
      })
      const result = await res.json()
      set_response(result as ApiResponse)
    } catch (err) {
      set_response({
        success: false,
        status: 0,
        statusText: 'Network Error',
        data: { error: err instanceof Error ? err.message : 'Failed' },
        elapsed_ms: 0,
      })
    } finally {
      set_is_testing(false)
    }
  }, [endpoint])

  const handle_save = useCallback(async () => {
    if (!endpoint.url || !endpoint.name) {
      set_result_msg({ type: 'error', text: 'Name and URL are required' })
      return
    }
    set_is_saving(true)
    try {
      const res = await fetch('/api/api-endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: endpoint.name,
          method: endpoint.method,
          url: endpoint.url,
          headers: endpoint.headers,
          authType: endpoint.authType,
          authConfig: endpoint.authConfig,
          queryParams: endpoint.queryParams,
          requestBody: endpoint.requestBody,
          lastResponse: response?.data ?? null,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        set_result_msg({ type: 'success', text: 'Endpoint saved!' })
        setTimeout(() => {
          router.push(
            `/admin/collections/api-endpoints/${(saved as Record<string, Record<string, string>>).doc?.id ?? (saved as Record<string, string>).id}`,
          )
        }, 600)
      } else {
        set_result_msg({ type: 'error', text: 'Failed to save endpoint' })
      }
    } catch {
      set_result_msg({ type: 'error', text: 'Failed to save endpoint' })
    } finally {
      set_is_saving(false)
    }
  }, [endpoint, response, router])

  const update_header = (idx: number, field: 'key' | 'value', val: string) => {
    const next = [...endpoint.headers]
    next[idx] = { ...next[idx]!, [field]: val }
    set_endpoint({ ...endpoint, headers: next })
  }

  const add_header = () =>
    set_endpoint({ ...endpoint, headers: [...endpoint.headers, { key: '', value: '' }] })
  const remove_header = (idx: number) =>
    set_endpoint({ ...endpoint, headers: endpoint.headers.filter((_, i) => i !== idx) })

  const update_param = (idx: number, field: 'key' | 'value', val: string) => {
    const next = [...endpoint.queryParams]
    next[idx] = { ...next[idx]!, [field]: val }
    set_endpoint({ ...endpoint, queryParams: next })
  }

  const add_param = () =>
    set_endpoint({ ...endpoint, queryParams: [...endpoint.queryParams, { key: '', value: '' }] })
  const remove_param = (idx: number) =>
    set_endpoint({ ...endpoint, queryParams: endpoint.queryParams.filter((_, i) => i !== idx) })

  const s = styles

  return (
    <div style={s.container}>
      <div style={s.mode_bar}>
        <button
          onClick={() => set_mode('form')}
          style={mode === 'form' ? { ...s.mode_btn, ...s.mode_btn_active } : s.mode_btn}
        >
          🧪 API Client
        </button>
        <button
          onClick={() => set_mode('import')}
          style={mode === 'import' ? { ...s.mode_btn, ...s.mode_btn_active } : s.mode_btn}
        >
          📋 Import (cURL / Postman / HTTPie)
        </button>
      </div>

      {result_msg && (
        <div
          style={{
            ...s.result_banner,
            ...(result_msg.type === 'success' ? s.result_success : s.result_error),
          }}
        >
          {result_msg.text}
        </div>
      )}

      {mode === 'import' && (
        <div style={s.import_area}>
          <p style={s.import_hint}>
            Paste a <strong>cURL</strong>, <strong>Postman</strong>, <strong>HTTPie</strong>, or{' '}
            <strong>raw HTTP</strong> request. Format is auto-detected.
          </p>
          <textarea
            value={curl_text}
            onChange={(e) => set_curl_text(e.target.value)}
            placeholder={`# cURL format:\ncurl 'https://api.example.com/products' \\\n  -H 'authorization: Bearer TOKEN'\n\n# Postman format:\nPOST 'https://api.example.com/search' \\\n  --header 'content-type: application/json' \\\n  --body '{"query":"test"}'\n\n# HTTPie format:\nhttp POST api.example.com/search query==test`}
            rows={10}
            style={s.import_textarea}
          />
          <div style={s.import_actions}>
            <button
              onClick={handle_import}
              disabled={!curl_text.trim()}
              style={!curl_text.trim() ? { ...s.btn_primary, opacity: 0.5 } : s.btn_primary}
            >
              Parse & Load into Client
            </button>
          </div>
        </div>
      )}

      {mode === 'form' && (
        <div style={s.form_area}>
          <div style={s.name_row}>
            <input
              value={endpoint.name}
              onChange={(e) => set_endpoint({ ...endpoint, name: e.target.value })}
              placeholder="Endpoint name (e.g. Search Products)"
              style={s.name_input}
            />
          </div>

          <div style={s.url_bar}>
            <select
              value={endpoint.method}
              onChange={(e) => set_endpoint({ ...endpoint, method: e.target.value })}
              style={{ ...s.method_select, color: method_colors[endpoint.method] ?? '#22c55e' }}
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              value={endpoint.url}
              onChange={(e) => set_endpoint({ ...endpoint, url: e.target.value })}
              placeholder="https://api.example.com/v1/products"
              style={s.url_input}
            />
            <button
              onClick={handle_test}
              disabled={is_testing || !endpoint.url}
              style={is_testing || !endpoint.url ? { ...s.send_btn, opacity: 0.5 } : s.send_btn}
            >
              {is_testing ? '⏳' : '▶'} Send
            </button>
          </div>

          <div style={s.tabs}>
            {(['headers', 'auth', 'body', 'params'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => set_active_tab(tab)}
                style={active_tab === tab ? { ...s.tab, ...s.tab_active } : s.tab}
              >
                {tab === 'headers' && `Headers (${endpoint.headers.length})`}
                {tab === 'auth' && (endpoint.authType !== 'none' ? `🔒 Auth` : 'Auth')}
                {tab === 'body' && (endpoint.requestBody ? '📦 Body' : 'Body')}
                {tab === 'params' && `Params (${endpoint.queryParams.length})`}
              </button>
            ))}
          </div>

          <div style={s.tab_content}>
            {active_tab === 'headers' && (
              <div>
                {endpoint.headers.map((h, i) => (
                  <div key={i} style={s.kv_row}>
                    <input
                      value={h.key}
                      onChange={(e) => update_header(i, 'key', e.target.value)}
                      placeholder="Key"
                      style={s.kv_input}
                    />
                    <input
                      value={h.value}
                      onChange={(e) => update_header(i, 'value', e.target.value)}
                      placeholder="Value"
                      style={s.kv_input}
                    />
                    <button onClick={() => remove_header(i)} style={s.kv_remove}>
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={add_header} style={s.add_btn}>
                  + Add Header
                </button>
              </div>
            )}

            {active_tab === 'auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <select
                  value={endpoint.authType}
                  onChange={(e) =>
                    set_endpoint({ ...endpoint, authType: e.target.value, authConfig: {} })
                  }
                  style={s.auth_select}
                >
                  <option value="none">No Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="api-key">API Key</option>
                  <option value="basic">Basic Auth</option>
                </select>
                {endpoint.authType === 'bearer' && (
                  <input
                    value={endpoint.authConfig.bearerToken ?? ''}
                    onChange={(e) =>
                      set_endpoint({
                        ...endpoint,
                        authConfig: { ...endpoint.authConfig, bearerToken: e.target.value },
                      })
                    }
                    placeholder="Paste token here..."
                    style={s.auth_input}
                  />
                )}
                {endpoint.authType === 'api-key' && (
                  <>
                    <input
                      value={endpoint.authConfig.apiKeyName ?? ''}
                      onChange={(e) =>
                        set_endpoint({
                          ...endpoint,
                          authConfig: { ...endpoint.authConfig, apiKeyName: e.target.value },
                        })
                      }
                      placeholder="Header name (e.g. X-API-Key)"
                      style={s.auth_input}
                    />
                    <input
                      value={endpoint.authConfig.apiKeyValue ?? ''}
                      onChange={(e) =>
                        set_endpoint({
                          ...endpoint,
                          authConfig: { ...endpoint.authConfig, apiKeyValue: e.target.value },
                        })
                      }
                      placeholder="API key value"
                      style={s.auth_input}
                    />
                  </>
                )}
                {endpoint.authType === 'basic' && (
                  <>
                    <input
                      value={endpoint.authConfig.basicUsername ?? ''}
                      onChange={(e) =>
                        set_endpoint({
                          ...endpoint,
                          authConfig: { ...endpoint.authConfig, basicUsername: e.target.value },
                        })
                      }
                      placeholder="Username"
                      style={s.auth_input}
                    />
                    <input
                      value={endpoint.authConfig.basicPassword ?? ''}
                      onChange={(e) =>
                        set_endpoint({
                          ...endpoint,
                          authConfig: { ...endpoint.authConfig, basicPassword: e.target.value },
                        })
                      }
                      placeholder="Password"
                      type="password"
                      style={s.auth_input}
                    />
                  </>
                )}
              </div>
            )}

            {active_tab === 'body' && (
              <textarea
                value={endpoint.requestBody}
                onChange={(e) => set_endpoint({ ...endpoint, requestBody: e.target.value })}
                placeholder='{"key": "value"}'
                rows={8}
                style={s.body_textarea}
              />
            )}

            {active_tab === 'params' && (
              <div>
                {endpoint.queryParams.map((p, i) => (
                  <div key={i} style={s.kv_row}>
                    <input
                      value={p.key}
                      onChange={(e) => update_param(i, 'key', e.target.value)}
                      placeholder="Key"
                      style={s.kv_input}
                    />
                    <input
                      value={p.value}
                      onChange={(e) => update_param(i, 'value', e.target.value)}
                      placeholder="Value"
                      style={s.kv_input}
                    />
                    <button onClick={() => remove_param(i)} style={s.kv_remove}>
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={add_param} style={s.add_btn}>
                  + Add Parameter
                </button>
              </div>
            )}
          </div>

          <div style={s.action_bar}>
            <button
              onClick={handle_save}
              disabled={is_saving}
              style={is_saving ? { ...s.btn_save, opacity: 0.5 } : s.btn_save}
            >
              {is_saving ? 'Saving...' : '💾 Save Endpoint'}
            </button>
          </div>
        </div>
      )}

      {response && (
        <div style={s.response_area}>
          <div style={s.response_status_bar}>
            <span
              style={{
                ...s.status_dot,
                background: response.status >= 200 && response.status < 300 ? '#22c55e' : '#ef4444',
              }}
            />
            <span
              style={{
                fontWeight: 700,
                color: response.status >= 200 && response.status < 300 ? '#22c55e' : '#ef4444',
              }}
            >
              {response.status} {response.statusText}
            </span>
            <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.8rem' }}>
              {response.elapsed_ms}ms
            </span>
          </div>
          <pre style={s.response_body}>
            {typeof response.data === 'string'
              ? response.data
              : JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

const method_colors: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
}

const styles = {
  container: {
    marginBottom: '1.5rem',
    background: 'var(--theme-elevation-50, #111)',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
    borderRadius: '12px',
    overflow: 'hidden',
  } as React.CSSProperties,

  mode_bar: {
    display: 'flex',
    borderBottom: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
  } as React.CSSProperties,

  mode_btn: {
    flex: 1,
    padding: '0.7rem 1rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--theme-elevation-500, #888)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  } as React.CSSProperties,

  mode_btn_active: {
    color: 'var(--theme-text, #fff)',
    borderBottomColor: '#6366f1',
    background: 'var(--theme-elevation-100, rgba(99,102,241,0.05))',
  } as React.CSSProperties,

  result_banner: {
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    borderBottom: '1px solid transparent',
  } as React.CSSProperties,

  result_success: {
    background: 'rgba(34,197,94,0.08)',
    color: '#22c55e',
    borderColor: 'rgba(34,197,94,0.2)',
  } as React.CSSProperties,

  result_error: {
    background: 'rgba(239,68,68,0.08)',
    color: '#ef4444',
    borderColor: 'rgba(239,68,68,0.2)',
  } as React.CSSProperties,

  import_area: {
    padding: '1rem 1.25rem',
  } as React.CSSProperties,

  import_hint: {
    fontSize: '0.82rem',
    color: 'var(--theme-elevation-500, #888)',
    margin: '0 0 0.6rem',
    lineHeight: 1.5,
  } as React.CSSProperties,

  import_textarea: {
    width: '100%',
    background: 'var(--theme-elevation-0, rgba(0,0,0,0.3))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.1))',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.78rem',
    fontFamily: 'monospace',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  import_actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.75rem',
  } as React.CSSProperties,

  form_area: {
    padding: '0',
  } as React.CSSProperties,

  name_row: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.06))',
  } as React.CSSProperties,

  name_input: {
    width: '100%',
    background: 'var(--theme-elevation-0, rgba(255,255,255,0.04))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  url_bar: {
    display: 'flex',
    padding: '0.5rem 1rem',
    gap: '0',
    borderBottom: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.06))',
  } as React.CSSProperties,

  method_select: {
    background: 'var(--theme-elevation-0, rgba(255,255,255,0.06))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.1))',
    borderRadius: '6px 0 0 6px',
    padding: '0.5rem 0.6rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    minWidth: '85px',
  } as React.CSSProperties,

  url_input: {
    flex: 1,
    background: 'var(--theme-elevation-0, rgba(255,255,255,0.04))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.1))',
    borderLeft: 'none',
    borderRight: 'none',
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    fontFamily: 'monospace',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
  } as React.CSSProperties,

  send_btn: {
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    color: '#fff',
    border: 'none',
    borderRadius: '0 6px 6px 0',
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  } as React.CSSProperties,

  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.06))',
  } as React.CSSProperties,

  tab: {
    padding: '0.5rem 0.9rem',
    fontSize: '0.78rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--theme-elevation-500, #888)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties,

  tab_active: {
    color: 'var(--theme-text, #fff)',
    borderBottomColor: '#6366f1',
  } as React.CSSProperties,

  tab_content: {
    padding: '0.75rem 1rem',
    minHeight: '80px',
  } as React.CSSProperties,

  kv_row: {
    display: 'flex',
    gap: '0.4rem',
    marginBottom: '0.35rem',
    alignItems: 'center',
  } as React.CSSProperties,

  kv_input: {
    flex: 1,
    background: 'var(--theme-elevation-0, rgba(255,255,255,0.04))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
    borderRadius: '4px',
    padding: '0.35rem 0.5rem',
    fontSize: '0.78rem',
    fontFamily: 'monospace',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
  } as React.CSSProperties,

  kv_remove: {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  add_btn: {
    fontSize: '0.75rem',
    padding: '0.3rem 0.6rem',
    background: 'rgba(99,102,241,0.1)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.4rem',
  } as React.CSSProperties,

  auth_select: {
    background: 'var(--theme-elevation-0, rgba(255,255,255,0.04))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
    borderRadius: '6px',
    padding: '0.5rem 0.6rem',
    fontSize: '0.82rem',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,

  auth_input: {
    background: 'var(--theme-elevation-0, rgba(255,255,255,0.04))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
    borderRadius: '6px',
    padding: '0.5rem 0.6rem',
    fontSize: '0.78rem',
    fontFamily: 'monospace',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  body_textarea: {
    width: '100%',
    background: 'var(--theme-elevation-0, rgba(0,0,0,0.3))',
    border: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.08))',
    borderRadius: '6px',
    padding: '0.6rem 0.75rem',
    fontSize: '0.78rem',
    fontFamily: 'monospace',
    color: 'var(--theme-text, #e4e4e7)',
    outline: 'none',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  action_bar: {
    padding: '0.6rem 1rem',
    borderTop: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.06))',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  } as React.CSSProperties,

  btn_primary: {
    padding: '0.5rem 1.25rem',
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,

  btn_save: {
    padding: '0.5rem 1.25rem',
    background: 'rgba(34,197,94,0.12)',
    color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,

  response_area: {
    borderTop: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.06))',
  } as React.CSSProperties,

  response_status_bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid var(--theme-elevation-150, rgba(255,255,255,0.04))',
    fontSize: '0.85rem',
  } as React.CSSProperties,

  status_dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  } as React.CSSProperties,

  response_body: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: 'var(--theme-text, #a1a1aa)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    maxHeight: '400px',
    overflow: 'auto',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
}

export default CurlImportAdmin
