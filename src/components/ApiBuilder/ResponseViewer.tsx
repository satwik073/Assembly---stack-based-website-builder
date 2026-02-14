'use client'

import React, { useState, useCallback } from 'react'
import JsonView from '@uiw/react-json-view'
import { vscodeTheme } from '@uiw/react-json-view/vscode'

interface ResponseViewerProps {
  data: unknown
  status?: number
  status_text?: string
  elapsed_ms?: number
  on_path_select?: (path: string) => void
  selected_path?: string
}

function JsonNode({
  data,
  path,
  depth,
  on_path_select,
  selected_path,
}: {
  data: unknown
  path: string
  depth: number
  on_path_select?: (path: string) => void
  selected_path?: string
}) {
  const [is_expanded, set_expanded] = useState(depth < 2)

  const is_selected = selected_path === path
  const data_type = Array.isArray(data) ? 'array' : typeof data

  const handle_click = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (on_path_select && path) {
        on_path_select(path)
      }
    },
    [on_path_select, path],
  )

  if (data === null || data === undefined) {
    return <span className="json-node__null">null</span>
  }

  if (typeof data === 'string') {
    return (
      <span
        className={`json-node__string ${is_selected ? 'json-node--selected' : ''}`}
        onClick={handle_click}
        title={`Path: ${path}`}
      >
        &quot;{data.length > 120 ? data.substring(0, 120) + '…' : data}&quot;
      </span>
    )
  }

  if (typeof data === 'number') {
    return (
      <span
        className={`json-node__number ${is_selected ? 'json-node--selected' : ''}`}
        onClick={handle_click}
        title={`Path: ${path}`}
      >
        {data}
      </span>
    )
  }

  if (typeof data === 'boolean') {
    return (
      <span
        className={`json-node__boolean ${is_selected ? 'json-node--selected' : ''}`}
        onClick={handle_click}
        title={`Path: ${path}`}
      >
        {data.toString()}
      </span>
    )
  }

  if (Array.isArray(data)) {
    return (
      <div className="json-node__container">
        <div
          className={`json-node__toggle ${is_selected ? 'json-node--selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            set_expanded(!is_expanded)
          }}
        >
          <span className="json-node__arrow">{is_expanded ? '▼' : '▶'}</span>
          <span className="json-node__type-badge json-node__type-badge--array">Array</span>
          <span className="json-node__count">[{data.length}]</span>
          {on_path_select && (
            <button
              className="json-node__select-btn"
              onClick={handle_click}
              title="Use this array as data source"
            >
              🎯 Use as data path
            </button>
          )}
        </div>
        {is_expanded && (
          <div className="json-node__children">
            {data.slice(0, 20).map((item, idx) => {
              const child_path = path ? `${path}[${idx}]` : `[${idx}]`
              return (
                <div key={idx} className="json-node__entry">
                  <span className="json-node__key">{idx}</span>
                  <span className="json-node__colon">: </span>
                  <JsonNode
                    data={item}
                    path={child_path}
                    depth={depth + 1}
                    on_path_select={on_path_select}
                    selected_path={selected_path}
                  />
                </div>
              )
            })}
            {data.length > 20 && (
              <div className="json-node__truncated">...{data.length - 20} more items</div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>)
    return (
      <div className="json-node__container">
        <div
          className={`json-node__toggle ${is_selected ? 'json-node--selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            set_expanded(!is_expanded)
          }}
        >
          <span className="json-node__arrow">{is_expanded ? '▼' : '▶'}</span>
          <span className="json-node__type-badge json-node__type-badge--object">Object</span>
          <span className="json-node__count">{`{${entries.length}}`}</span>
        </div>
        {is_expanded && (
          <div className="json-node__children">
            {entries.map(([key, value]) => {
              const child_path = path ? `${path}.${key}` : key
              return (
                <div key={key} className="json-node__entry">
                  <span className="json-node__key">&quot;{key}&quot;</span>
                  <span className="json-node__colon">: </span>
                  <JsonNode
                    data={value}
                    path={child_path}
                    depth={depth + 1}
                    on_path_select={on_path_select}
                    selected_path={selected_path}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return <span>{String(data)}</span>
}

const JsonViewerWrapper = ({ data }: { data: any }) => {
  return (
    <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
      <JsonView
        value={data}
        style={{ ...vscodeTheme, '--w-rjv-background': 'transparent' } as any}
        displayDataTypes={false}
        enableClipboard={true}
      />
    </div>
  )
}

export function ResponseViewer({
  data,
  status,
  status_text,
  elapsed_ms,
  on_path_select,
  selected_path,
}: ResponseViewerProps) {
  const [view_mode, set_view_mode] = useState<'picker' | 'pretty' | 'raw'>('pretty')

  // Auto-switch to picker if on_path_select is provided and we are initially loading
  // Actually default to Pretty because it looks better, user can switch to Picker to select.

  const status_color =
    status && status >= 200 && status < 300
      ? '#22c55e'
      : status && status >= 400
        ? '#ef4444'
        : '#f59e0b'

  return (
    <div className="response-viewer">
      {status !== undefined && (
        <div className="response-viewer__status-bar">
          <div className="response-viewer__status">
            <span
              className="response-viewer__status-dot"
              style={{ backgroundColor: status_color }}
            />
            <span className="response-viewer__status-code" style={{ color: status_color }}>
              {status}
            </span>
            <span className="response-viewer__status-text">{status_text}</span>
          </div>
          {elapsed_ms !== undefined && (
            <span className="response-viewer__timing">{elapsed_ms}ms</span>
          )}
          <div className="response-viewer__view-toggle">
            <button
              className={`response-viewer__view-btn ${view_mode === 'pretty' ? 'response-viewer__view-btn--active' : ''}`}
              onClick={() => set_view_mode('pretty')}
              title="Formatted JSON view"
            >
              Pretty
            </button>
            <button
              className={`response-viewer__view-btn ${view_mode === 'picker' ? 'response-viewer__view-btn--active' : ''}`}
              onClick={() => set_view_mode('picker')}
              title="Select data fields for mapping"
            >
              Picker
            </button>
            <button
              className={`response-viewer__view-btn ${view_mode === 'raw' ? 'response-viewer__view-btn--active' : ''}`}
              onClick={() => set_view_mode('raw')}
            >
              Raw
            </button>
          </div>
        </div>
      )}

      {selected_path && (
        <div className="response-viewer__selected-path">
          <span className="response-viewer__path-label">Selected Data Path:</span>
          <code className="response-viewer__path-value">{selected_path}</code>
        </div>
      )}

      <div className="response-viewer__body">
        {view_mode === 'picker' && (
          <div style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '13px' }}>
            <div
              style={{ marginBottom: '1rem', color: '#aaa', fontSize: '12px', fontStyle: 'italic' }}
            >
              Click on arrow keys ▶ to expand/collapse. Click &quot; Use as data path&quot; to
              select arrays. Click properties to select them.
            </div>
            <JsonNode
              data={data}
              path=""
              depth={0}
              on_path_select={on_path_select}
              selected_path={selected_path}
            />
          </div>
        )}
        {view_mode === 'pretty' && <JsonViewerWrapper data={data} />}
        {view_mode === 'raw' && (
          <pre className="response-viewer__raw">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}
