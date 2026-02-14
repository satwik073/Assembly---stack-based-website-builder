'use client'

import React, { useState, useCallback } from 'react'
import { ApiEndpointForm } from '@/components/ApiBuilder/ApiEndpointForm'
import { ResponseViewer } from '@/components/ApiBuilder/ResponseViewer'
import { TemplateBuilder } from '@/components/ApiBuilder/TemplateBuilder'
import type { CardTemplateConfig } from '@/components/ApiBuilder/TemplateBuilder'
import './api-dashboard.css'

interface SavedEndpoint {
  id?: string
  name: string
  method: string
  url: string
  headers: Array<{ key: string; value: string }>
  authType: string
  authConfig: Record<string, string>
  queryParams: Array<{ key: string; value: string }>
  requestBody: string
  dataPath?: string
  cardTemplate?: CardTemplateConfig
  lastResponse?: unknown
}

interface ApiResponse {
  success: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  data: unknown
  elapsed_ms: number
  error?: string
}

export default function ApiDashboardPage({ params }: { params: Promise<{ siteId: string }> }) {
  const [site_id, set_site_id] = useState<string>('')
  const [endpoints, set_endpoints] = useState<SavedEndpoint[]>([])
  const [active_endpoint, set_active_endpoint] = useState<SavedEndpoint | null>(null)
  const [response, set_response] = useState<ApiResponse | null>(null)
  const [is_loading, set_is_loading] = useState(false)
  const [data_path, set_data_path] = useState('')

  const [active_view, set_active_view] = useState<'config' | 'response' | 'template'>('config')
  const [save_status, set_save_status] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // ...

  // Update onClick handler to stay on current view or specific behavior?
  // Let's keep it simple: selecting an endpoint stays on 'config' or switches?
  // User wants to avoid creating new request.
  // If I load an endpoint with template, maybe switch to template?
  // Let's stick to 'config' default on selection for now, or 'response' if data exists?
  // The user complained about "creating new request".
  // So if I click an endpoint, I want to see the RESULT if available.
  // I will switch to 'response' if lastResponse exists, or 'config' otherwise.

  React.useEffect(() => {
    params.then((p) => {
      set_site_id(p.siteId)
      fetch_endpoints(p.siteId)
    })
  }, [params])

  const fetch_endpoints = async (sid: string) => {
    try {
      const res = await fetch(`/api/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          url: `${window.location.origin}/api/api-endpoints?where[site][equals]=${sid}&depth=0`,
        }),
      })
      const result = await res.json()
      if (result?.data?.docs) {
        set_endpoints(
          result.data.docs.map((doc: Record<string, unknown>) => ({
            id: doc.id as string,
            name: (doc.name as string) ?? '',
            method: (doc.method as string) ?? 'GET',
            url: (doc.url as string) ?? '',
            headers: (doc.headers as Array<{ key: string; value: string }>) ?? [],
            authType: (doc.authType as string) ?? 'none',
            authConfig: (doc.authConfig as Record<string, string>) ?? {},
            queryParams: (doc.queryParams as Array<{ key: string; value: string }>) ?? [],
            requestBody: (doc.requestBody as string) ?? '',
            dataPath: (doc.dataPath as string) ?? '',
            cardTemplate: doc.cardTemplate as CardTemplateConfig | undefined,
            lastResponse: doc.lastResponse,
          })),
        )
      }
    } catch {
      // silently handle - endpoints may not exist yet
    }
  }

  const execute_request = useCallback(
    async (config: {
      method: string
      url: string
      headers: Array<{ key: string; value: string }>
      authType: string
      authConfig: Record<string, string>
      queryParams: Array<{ key: string; value: string }>
      requestBody: string
    }) => {
      set_is_loading(true)
      set_response(null)
      try {
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: config.method,
            url: config.url,
            headers: config.headers,
            authType: config.authType,
            authConfig: config.authConfig,
            queryParams: config.queryParams,
            body: config.requestBody,
          }),
        })
        const result: ApiResponse = await res.json()
        set_response(result)
        set_active_view('response')
      } catch (err) {
        set_response({
          success: false,
          status: 0,
          statusText: 'Network Error',
          headers: {},
          data: { error: err instanceof Error ? err.message : 'Failed to connect' },
          elapsed_ms: 0,
        })
      } finally {
        set_is_loading(false)
      }
    },
    [],
  )

  const save_endpoint = useCallback(
    async (config: {
      name: string
      method: string
      url: string
      headers: Array<{ key: string; value: string }>
      authType: string
      authConfig: Record<string, string>
      queryParams: Array<{ key: string; value: string }>
      requestBody: string
    }) => {
      set_save_status('saving')
      try {
        const payload_body = {
          name: config.name,
          site: site_id,
          method: config.method,
          url: config.url,
          headers: config.headers,
          authType: config.authType,
          authConfig: config.authConfig,
          queryParams: config.queryParams,
          requestBody: config.requestBody,
          dataPath: data_path,
          lastResponse: response?.data ?? null,
          cardTemplate: active_endpoint?.cardTemplate ?? null,
        }

        const endpoint_id = active_endpoint?.id
        const api_url = endpoint_id ? `/api/api-endpoints/${endpoint_id}` : `/api/api-endpoints`
        const api_method = endpoint_id ? 'PATCH' : 'POST'

        const res = await fetch(api_url, {
          method: api_method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload_body),
        })

        if (res.ok) {
          const saved = await res.json()
          if (endpoint_id) {
            set_endpoints((prev) =>
              prev.map((ep) =>
                ep.id === endpoint_id ? { ...ep, ...config, id: endpoint_id } : ep,
              ),
            )
          } else {
            const new_ep: SavedEndpoint = { ...config, id: saved.doc?.id ?? saved.id }
            set_endpoints((prev) => [...prev, new_ep])
            set_active_endpoint(new_ep)
          }
          set_save_status('saved')
          setTimeout(() => set_save_status('idle'), 2000)
        } else {
          set_save_status('error')
          setTimeout(() => set_save_status('idle'), 3000)
        }
      } catch {
        set_save_status('error')
        setTimeout(() => set_save_status('idle'), 3000)
      }
    },
    [site_id, data_path, response, active_endpoint],
  )

  const handle_path_select = useCallback((path: string) => {
    set_data_path(path)
    set_active_view('template')
  }, [])

  const handle_template_change = useCallback(
    (template: CardTemplateConfig) => {
      if (active_endpoint) {
        set_active_endpoint({ ...active_endpoint, cardTemplate: template })
      }
    },
    [active_endpoint],
  )

  const delete_endpoint = useCallback(
    async (endpoint_id: string) => {
      try {
        await fetch(`/api/api-endpoints/${endpoint_id}`, { method: 'DELETE' })
        set_endpoints((prev) => prev.filter((ep) => ep.id !== endpoint_id))
        if (active_endpoint?.id === endpoint_id) {
          set_active_endpoint(null)
          set_response(null)
          set_data_path('')
        }
      } catch {
        // silently handle
      }
    },
    [active_endpoint],
  )

  return (
    <div className="api-dashboard">
      <div className="api-dashboard__header">
        <div className="api-dashboard__title-area">
          <a href={`/dashboard/sites/${site_id}`} className="api-dashboard__back">
            ← Back to Site
          </a>
          <h1 className="api-dashboard__title">
            <span className="api-dashboard__title-icon">⚡</span>
            API Integration Hub
          </h1>
          <p className="api-dashboard__subtitle">
            Connect external APIs, map response data, and create dynamic UI templates
          </p>
        </div>
        {save_status === 'saving' && (
          <span className="api-dashboard__save-status api-dashboard__save-status--saving">
            Saving...
          </span>
        )}
        {save_status === 'saved' && (
          <span className="api-dashboard__save-status api-dashboard__save-status--saved">
            ✓ Saved
          </span>
        )}
        {save_status === 'error' && (
          <span className="api-dashboard__save-status api-dashboard__save-status--error">
            ✗ Error
          </span>
        )}
      </div>

      <div className="api-dashboard__layout">
        <aside className="api-dashboard__endpoints-panel">
          <div className="api-dashboard__panel-header">
            <h3>Saved Endpoints</h3>
            <button
              className="api-dashboard__new-btn"
              onClick={() => {
                set_active_endpoint(null)
                set_response(null)
                set_data_path('')
              }}
            >
              + New
            </button>
          </div>
          <div className="api-dashboard__endpoints-list">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                className={`api-dashboard__endpoint-item ${active_endpoint?.id === ep.id ? 'api-dashboard__endpoint-item--active' : ''}`}
                onClick={() => {
                  set_active_endpoint(ep)
                  set_data_path(ep.dataPath ?? '')
                  if (ep.lastResponse) {
                    set_active_view('response')
                    set_response({
                      success: true,
                      status: 200,
                      statusText: 'Loaded from history',
                      headers: {},
                      data: ep.lastResponse,
                      elapsed_ms: 0,
                    })
                  } else {
                    set_active_view('config')
                    set_response(null)
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <span
                  className={`api-dashboard__endpoint-method api-dashboard__endpoint-method--${ep.method.toLowerCase()}`}
                >
                  {ep.method}
                </span>
                <div className="api-dashboard__endpoint-info">
                  <span className="api-dashboard__endpoint-name">{ep.name}</span>
                  <span className="api-dashboard__endpoint-url">{ep.url}</span>
                </div>
                <div className="api-dashboard__endpoint-actions">
                  <button
                    className="api-dashboard__endpoint-action"
                    title="Open Template Builder"
                    onClick={(e) => {
                      e.stopPropagation()
                      set_active_endpoint(ep)
                      set_data_path(ep.dataPath ?? '')
                      if (ep.lastResponse) {
                        set_response({
                          success: true,
                          status: 200,
                          statusText: 'Loaded from history',
                          headers: {},
                          data: ep.lastResponse,
                          elapsed_ms: 0,
                        })
                      } else {
                        set_response(null)
                      }
                      set_active_view('template')
                    }}
                  >
                    🎨
                  </button>
                  <button
                    className="api-dashboard__endpoint-action api-dashboard__endpoint-action--delete"
                    title="Delete Endpoint"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (ep.id) delete_endpoint(ep.id)
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {endpoints.length === 0 && (
              <div className="api-dashboard__no-endpoints">
                <span className="api-dashboard__no-endpoints-icon">🔌</span>
                <p>No endpoints yet</p>
                <p className="api-dashboard__no-endpoints-hint">Create your first API connection</p>
              </div>
            )}
          </div>
        </aside>

        <main className="api-dashboard__main">
          <div className="api-dashboard__view-tabs">
            <button
              className={`api-dashboard__view-tab ${active_view === 'config' ? 'active' : ''}`}
              onClick={() => set_active_view('config')}
            >
              ⚙️ Config
            </button>
            <button
              className={`api-dashboard__view-tab ${active_view === 'response' ? 'active' : ''}`}
              onClick={() => set_active_view('response')}
              disabled={!response}
              style={{ opacity: !response ? 0.5 : 1 }}
            >
              📄 Response
              {response && (
                <span
                  className="api-dashboard__result-tab-badge"
                  style={{
                    backgroundColor:
                      response.status >= 200 && response.status < 300
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(239,68,68,0.2)',
                    color: response.status >= 200 && response.status < 300 ? '#22c55e' : '#ef4444',
                    marginLeft: '6px',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {response.status}
                </span>
              )}
            </button>
            <button
              className={`api-dashboard__view-tab ${active_view === 'template' ? 'active' : ''}`}
              onClick={() => set_active_view('template')}
              disabled={!response?.data}
              style={{ opacity: !response?.data ? 0.5 : 1 }}
            >
              🎨 Template Builder
            </button>
          </div>

          <div style={{ display: active_view === 'config' ? 'block' : 'none' }}>
            <ApiEndpointForm
              initial_config={active_endpoint ?? undefined}
              on_submit={save_endpoint}
              on_test={(req) => {
                execute_request(req)
                // executing request automatically switches tab?
                // Let's keep user on config or switch to response?
                // execute_request is async.
                // We can listen to response change to switch tab?
                // But execute_request is passed form data.
                // let's just let user switch manually or handle it in execute_request if possible.
                // But execute_request sets response.
                // We can Add useEffect to switch tab when response changes?
                // No, that might be annoying if loading history.
                // We'll leave it manual for now.
              }}
              is_loading={is_loading}
              key={active_endpoint?.id ?? 'new'}
            />
          </div>

          {active_view === 'response' && (
            <div className="api-dashboard__result-content" style={{ marginTop: '20px' }}>
              {response ? (
                <ResponseViewer
                  data={response.data}
                  status={response.status}
                  status_text={response.statusText}
                  elapsed_ms={response.elapsed_ms}
                  on_path_select={(path) => {
                    handle_path_select(path)
                    // Optionally switch to template view automatically?
                    // set_active_view('template')
                  }}
                  selected_path={data_path}
                />
              ) : (
                <div className="api-dashboard__empty-state">
                  No response data available. Run the request first.
                </div>
              )}
            </div>
          )}

          {active_view === 'template' && (
            <div className="api-dashboard__result-content" style={{ marginTop: '20px' }}>
              {response?.data ? (
                <TemplateBuilder
                  response_data={response.data}
                  data_path={data_path}
                  initial_template={active_endpoint?.cardTemplate}
                  on_template_change={handle_template_change}
                />
              ) : (
                <div className="api-dashboard__empty-state">
                  No data to build template. Run the request first.
                </div>
              )}
            </div>
          )}
        </main>
        <style jsx>{`
          .api-dashboard__view-tabs {
            display: flex;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 20px;
            background: #fff;
          }
          .api-dashboard__view-tab {
            padding: 12px 20px;
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: all 0.2s;
          }
          .api-dashboard__view-tab:hover:not(:disabled) {
            color: #1e293b;
            background: #f8fafc;
          }
          .api-dashboard__view-tab.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
          }
          .api-dashboard__view-tab:disabled {
            cursor: not-allowed;
          }
          .api-dashboard__empty-state {
            padding: 40px;
            text-align: center;
            color: #94a3b8;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
          }
          .api-dashboard__endpoint-actions {
            display: flex;
            gap: 4px;
            margin-left: auto;
            flex-shrink: 0;
          }
          .api-dashboard__endpoint-action {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            width: 28px;
            height: 28px;
            transition: all 0.2s;
          }
          .api-dashboard__endpoint-action:hover {
            background: #e2e8f0;
            color: #1e293b;
          }
          .api-dashboard__endpoint-action--delete:hover {
            background: #fee2e2;
            color: #ef4444;
          }
        `}</style>
      </div>
    </div>
  )
}
