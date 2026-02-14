'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { analyzeSchema, getValueAtPath, flattenFields } from '@/utilities/schemaAnalyzer'

// No external CSS import - using inline styles

export interface FieldMapping {
  id: string
  element_type: 'image' | 'heading' | 'text' | 'badge' | 'link' | 'price' | 'row' | 'column'
  field_path?: string
  label?: string
  children?: FieldMapping[]
  style?: React.CSSProperties
  static_text?: string
}

export interface CardTemplateConfig {
  root_element: FieldMapping
  grid_columns: number
  card_style: 'minimal' | 'elevated' | 'bordered' | 'glassmorphic' | 'none'
}

interface TemplateBuilderProps {
  response_data: unknown
  data_path: string
  initial_template?: CardTemplateConfig
  on_template_change: (template: CardTemplateConfig) => void
}

const ELEMENT_TYPES = [
  { value: 'row', label: 'Row (Horizontal)', icon: '↔️' },
  { value: 'column', label: 'Column (Vertical)', icon: '↕️' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'heading', label: 'Heading', icon: '📝' },
  { value: 'text', label: 'Text', icon: '📄' },
  { value: 'badge', label: 'Badge', icon: '🏷️' },
  { value: 'link', label: 'Link', icon: '🔗' },
  { value: 'price', label: 'Price', icon: '💰' },
]

const CARD_STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'glassmorphic', label: 'Glassmorphic' },
  { value: 'none', label: 'None (Transparent)' },
]

let mapping_id_counter = 0
function generateMappingId(): string {
  mapping_id_counter++
  return `el_${Date.now()}_${mapping_id_counter}`
}

function find_node(root: FieldMapping, id: string): FieldMapping | null {
  if (root.id === id) return root
  if (root.children) {
    for (const child of root.children) {
      const found = find_node(child, id)
      if (found) return found
    }
  }
  return null
}

function remove_node(root: FieldMapping, id: string): FieldMapping {
  if (root.children) {
    return {
      ...root,
      children: root.children.filter((c) => c.id !== id).map((c) => remove_node(c, id)),
    }
  }
  return root
}

function add_node(root: FieldMapping, parent_id: string, new_node: FieldMapping): FieldMapping {
  if (root.id === parent_id) {
    return {
      ...root,
      children: [...(root.children || []), new_node],
    }
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((c) => add_node(c, parent_id, new_node)),
    }
  }
  return root
}

function update_node(root: FieldMapping, id: string, updates: Partial<FieldMapping>): FieldMapping {
  if (root.id === id) {
    return { ...root, ...updates }
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((c) => update_node(c, id, updates)),
    }
  }
  return root
}

// Default root defined outside to be available for init
const default_root: FieldMapping = {
  id: 'root',
  element_type: 'column',
  children: [],
  style: { padding: '16px', gap: '8px', display: 'flex', flexDirection: 'column' },
}

export function TemplateBuilder({
  response_data,
  data_path,
  initial_template,
  on_template_change,
}: TemplateBuilderProps) {
  const [root_element, set_root_element] = useState<FieldMapping>(() => {
    if (initial_template?.root_element) return initial_template.root_element

    // Migration for old structure (flat mappings)
    // @ts-ignore
    if (initial_template?.mappings && Array.isArray(initial_template.mappings)) {
      return {
        ...default_root,
        children: (initial_template as any).mappings.map((m: any) => ({
          ...m,
          children: [], // Ensure children prop exists
          // Map old styles if needed, or keep defaults
        })),
      }
    }
    return default_root
  })

  const [grid_columns, set_grid_columns] = useState(initial_template?.grid_columns ?? 3)
  const [card_style, set_card_style] = useState(initial_template?.card_style ?? 'elevated')
  const [selected_element_id, set_selected_element_id] = useState<string | null>(null)
  const [preview_mode, set_preview_mode] = useState<'single' | 'grid'>('single')
  const [drag_source, set_drag_source] = useState<{
    type: 'sidebar' | 'canvas'
    id: string
  } | null>(null)

  const items_array = useMemo(() => {
    if (!response_data || !data_path) return []
    const value = getValueAtPath(response_data, data_path)
    if (Array.isArray(value)) return value
    // Handle object collections (dictionaries)
    if (typeof value === 'object' && value !== null) return Object.values(value)
    return []
  }, [response_data, data_path])

  const item_schema = useMemo(() => {
    if (items_array.length === 0) return null
    return analyzeSchema(items_array[0], '', 'item')
  }, [items_array])

  const available_fields = useMemo(() => {
    if (!item_schema) return []
    return flattenFields(item_schema)
  }, [item_schema])

  const emit_change = useCallback(
    (new_root: FieldMapping) => {
      on_template_change({
        root_element: new_root,
        grid_columns,
        card_style,
      })
    },
    [on_template_change, grid_columns, card_style],
  )

  const handle_add_element = (
    parent_id: string,
    type: FieldMapping['element_type'],
    field_path?: string,
  ) => {
    const new_node: FieldMapping = {
      id: generateMappingId(),
      element_type: type,
      field_path,
      label: field_path ? field_path.split('.').pop() : type,
      children: type === 'row' || type === 'column' ? [] : undefined,
      style:
        type === 'row'
          ? { display: 'flex', flexDirection: 'row', gap: '8px' }
          : type === 'column'
            ? { display: 'flex', flexDirection: 'column', gap: '8px' }
            : undefined,
    }

    if (type === 'image') {
      new_node.style = { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }
    }

    const new_root = add_node(root_element, parent_id, new_node)
    set_root_element(new_root)
    emit_change(new_root)
    set_selected_element_id(new_node.id)
  }

  const handle_remove_element = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (id === 'root') return
    const new_root = remove_node(root_element, id)
    set_root_element(new_root)
    emit_change(new_root)
    if (selected_element_id === id) set_selected_element_id(null)
  }

  const handle_style_change = (style_prop: string, value: string) => {
    if (!selected_element_id) return
    const current_node = find_node(root_element, selected_element_id)
    if (!current_node) return

    const new_style = { ...current_node.style, [style_prop]: value }
    const new_root = update_node(root_element, selected_element_id, { style: new_style })
    set_root_element(new_root)
    emit_change(new_root)
  }

  const render_builder_node = (node: FieldMapping) => {
    const is_selected = selected_element_id === node.id
    const is_container = node.element_type === 'row' || node.element_type === 'column'

    return (
      <div
        key={node.id}
        className={`builder-node builder-node--${node.element_type} ${is_selected ? 'builder-node--selected' : ''}`}
        style={node.style}
        onClick={(e) => {
          e.stopPropagation()
          set_selected_element_id(node.id)
        }}
        onDragOver={(e) => {
          if (is_container) {
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.classList.add('builder-node--drag-over')
          }
        }}
        onDragLeave={(e) => {
          if (is_container) {
            e.currentTarget.classList.remove('builder-node--drag-over')
          }
        }}
        onDrop={(e) => {
          if (is_container) {
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.classList.remove('builder-node--drag-over')

            if (drag_source?.type === 'sidebar') {
              if (drag_source.id.startsWith('field:')) {
                const path = drag_source.id.substring(6)
                let type: FieldMapping['element_type'] = 'text'
                if (path.toLowerCase().includes('image') || path.toLowerCase().includes('url'))
                  type = 'image'
                handle_add_element(node.id, type, path)
              } else if (drag_source.id.startsWith('type:')) {
                const type = drag_source.id.substring(5) as FieldMapping['element_type']
                handle_add_element(node.id, type)
              }
            }
          }
        }}
      >
        {is_container && <div className="builder-node__label">{node.element_type}</div>}

        {!is_container && (
          <div className="builder-node__content">
            {node.element_type === 'image' && (
              <span className="builder-node__placeholder-img">
                Image: {node.field_path || 'Static'}
              </span>
            )}
            {node.element_type !== 'image' && (
              <span>{node.field_path ? `Bound: ${node.field_path}` : node.element_type}</span>
            )}
          </div>
        )}

        {node.children?.map((child) => render_builder_node(child))}

        {is_container && node.children?.length === 0 && (
          <div className="builder-node__empty">Drop items here</div>
        )}

        {node.id !== 'root' && (
          <button
            className="builder-node__remove"
            onClick={(e) => handle_remove_element(node.id, e)}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  const render_preview_node = (node: FieldMapping, item: any) => {
    let content: any = null
    const style = { ...node.style }

    if (node.field_path) {
      const val = getValueAtPath(item, node.field_path)
      content = val !== null && val !== undefined ? String(val) : ''
    }

    if (node.children) {
      return (
        <div
          key={node.id}
          style={style}
          className={`preview-node preview-node--${node.element_type}`}
        >
          {node.children.map((child) => render_preview_node(child, item))}
        </div>
      )
    }

    if (node.element_type === 'image') {
      return (
        <img
          key={node.id}
          src={content || 'https://via.placeholder.com/150'}
          alt=""
          style={style}
          loading="lazy"
        />
      )
    }

    if (node.element_type === 'heading') {
      return (
        <h3 key={node.id} style={style}>
          {content || 'Heading'}
        </h3>
      )
    }

    if (node.element_type === 'link') {
      return (
        <a key={node.id} href={content || '#'} style={style}>
          {node.label || 'Link'}
        </a>
      )
    }

    if (node.element_type === 'price') {
      return (
        <span key={node.id} style={style}>
          ${content || '0.00'}
        </span>
      )
    }

    return (
      <span key={node.id} style={style}>
        {content || 'Text'}
      </span>
    )
  }

  const selected_node = selected_element_id ? find_node(root_element, selected_element_id) : null

  return (
    <div className="template-builder-v2">
      <div className="tb-sidebar">
        <div className="tb-section">
          <h4>Layout Blocks</h4>
          <div className="tb-blocks-grid">
            {ELEMENT_TYPES.slice(0, 2).map((type) => (
              <div
                key={type.value}
                className="tb-draggable-item"
                draggable
                onDragStart={() => set_drag_source({ type: 'sidebar', id: `type:${type.value}` })}
                onDragEnd={() => set_drag_source(null)}
              >
                {type.icon} {type.label}
              </div>
            ))}
          </div>
        </div>

        <div className="tb-section">
          <h4>Data Fields</h4>
          <div className="tb-fields-list">
            {available_fields.map((field) => (
              <div
                key={field.path}
                className="tb-draggable-field"
                draggable
                onDragStart={() => set_drag_source({ type: 'sidebar', id: `field:${field.path}` })}
                onDragEnd={() => set_drag_source(null)}
              >
                <span className="tb-field-key">{field.key}</span>
                <span className="tb-field-type">{field.type}</span>
              </div>
            ))}
            {available_fields.length === 0 && (
              <p className="tb-empty-text">No fields available. Please check your data path.</p>
            )}
          </div>
        </div>
      </div>

      <div className="tb-main">
        <div className="tb-canvas-area">
          <div className="tb-toolbar">
            <span className="tb-title">Builder Canvas</span>
            <button
              className="tb-reset-btn"
              onClick={() => {
                set_root_element(default_root)
                emit_change(default_root)
              }}
            >
              Reset Properties
            </button>
          </div>
          <div className="tb-canvas-scroller">{render_builder_node(root_element)}</div>
        </div>

        <div className="tb-preview-area">
          <div className="tb-toolbar">
            <span className="tb-title">Preview ({items_array.length} items)</span>
            <div>
              <button
                className={`tb-mode-btn ${preview_mode === 'single' ? 'active' : ''}`}
                onClick={() => set_preview_mode('single')}
              >
                Single
              </button>
              <button
                className={`tb-mode-btn ${preview_mode === 'grid' ? 'active' : ''}`}
                onClick={() => set_preview_mode('grid')}
              >
                Grid
              </button>
            </div>
          </div>

          {items_array.length > 0 ? (
            <div className="tb-preview-viewport">
              <div
                className="tb-preview-grid"
                style={{
                  gridTemplateColumns: `repeat(${preview_mode === 'single' ? 1 : grid_columns}, 1fr)`,
                }}
              >
                {items_array.slice(0, preview_mode === 'single' ? 1 : 12).map((item: any, i) => (
                  <div key={i} className={`tb-preview-card tb-card-${card_style}`}>
                    {render_preview_node(root_element, item)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="tb-empty-state">No data to preview</div>
          )}
        </div>
      </div>

      <div className="tb-properties">
        {selected_node ? (
          <>
            <h4>Properties: {selected_node.element_type}</h4>
            <div className="tb-prop-group">
              <label>Padding</label>
              <input
                type="text"
                value={selected_node.style?.padding || ''}
                onChange={(e) => handle_style_change('padding', e.target.value)}
                placeholder="16px"
              />
            </div>

            <div className="tb-prop-group">
              <label>Width</label>
              <input
                type="text"
                value={selected_node.style?.width || ''}
                onChange={(e) => handle_style_change('width', e.target.value)}
                placeholder="100%"
              />
            </div>

            <div className="tb-prop-group">
              <label>Height</label>
              <input
                type="text"
                value={selected_node.style?.height || ''}
                onChange={(e) => handle_style_change('height', e.target.value)}
                placeholder="auto"
              />
            </div>

            {(selected_node.element_type === 'row' || selected_node.element_type === 'column') && (
              <div className="tb-prop-group">
                <label>Gap</label>
                <input
                  type="text"
                  value={selected_node.style?.gap || ''}
                  onChange={(e) => handle_style_change('gap', e.target.value)}
                  placeholder="8px"
                />
              </div>
            )}

            {(selected_node.element_type === 'text' ||
              selected_node.element_type === 'heading' ||
              selected_node.element_type === 'price') && (
              <>
                <div className="tb-prop-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={
                      selected_node.style?.color ? String(selected_node.style.color) : '#000000'
                    }
                    onChange={(e) => handle_style_change('color', e.target.value)}
                  />
                </div>
                <div className="tb-prop-group">
                  <label>Font Size</label>
                  <input
                    type="text"
                    value={selected_node.style?.fontSize || ''}
                    onChange={(e) => handle_style_change('fontSize', e.target.value)}
                    placeholder="16px"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="tb-prop-empty">Select an element to edit styles</div>
        )}

        <div className="tb-section" style={{ marginTop: '20px' }}>
          <h4>Grid Settings</h4>
          <div className="tb-prop-group">
            <label>Columns (Grid Mode)</label>
            <input
              type="number"
              min="1"
              max="6"
              value={grid_columns}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1
                set_grid_columns(val)
                emit_change(root_element) // updates grid col state
              }}
            />
          </div>
          <div className="tb-prop-group">
            <label>Card Style</label>
            <select
              value={card_style}
              onChange={(e) => {
                set_card_style(e.target.value as any)
                emit_change(root_element)
              }}
            >
              {CARD_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <style jsx>{`
        .template-builder-v2 {
          display: flex;
          height: 650px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-family: system-ui, sans-serif;
          border-radius: 8px;
          overflow: hidden;
        }
        .tb-sidebar {
          width: 240px;
          border-right: 1px solid #e2e8f0;
          padding: 16px;
          overflow-y: auto;
          background: #f8fafc;
        }
        .tb-section {
          margin-bottom: 24px;
        }
        .tb-section h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 12px;
        }
        .tb-blocks-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .tb-draggable-item {
          padding: 12px 8px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          cursor: grab;
          text-align: center;
          color: #334155;
          transition: all 0.2s;
        }
        .tb-draggable-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .tb-draggable-field {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
          cursor: grab;
          font-size: 12px;
          background: #fff;
        }
        .tb-draggable-field:hover {
          background: #f1f5f9;
        }
        .tb-field-key {
          color: #334155;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 140px;
        }
        .tb-field-type {
          font-size: 10px;
          color: #94a3b8;
          background: #f8fafc;
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid #e2e8f0;
        }

        .tb-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .tb-canvas-area {
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          background: #f1f5f9;
          padding: 0;
          overflow: hidden;
        }
        .tb-preview-area {
          height: 320px;
          background: #fff;
          display: flex;
          flex-direction: column;
          border-top: 1px solid #e2e8f0;
        }
        .tb-properties {
          width: 260px;
          border-left: 1px solid #e2e8f0;
          padding: 16px;
          background: #fff;
          overflow-y: auto;
        }
        .tb-toolbar {
          padding: 12px 16px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tb-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }
        .tb-reset-btn,
        .tb-mode-btn {
          font-size: 11px;
          padding: 4px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          background: #fff;
          color: #475569;
          margin-left: 4px;
        }
        .tb-mode-btn.active {
          background: #e2e8f0;
          font-weight: 600;
          color: #0f172a;
        }

        .tb-canvas-scroller {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        /* Builder Node Styles */
        .builder-node {
          border: 1px dashed #94a3b8;
          padding: 16px;
          min-height: 50px;
          background: #fff;
          position: relative;
          margin-bottom: 0;
          transition: all 0.2s;
        }
        .builder-node:hover {
          border-color: #3b82f6;
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.1);
        }
        .builder-node--selected {
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
          z-index: 10;
        }
        .builder-node--drag-over {
          background: #eff6ff;
          border-color: #3b82f6;
          border-style: solid;
        }
        .builder-node__label {
          position: absolute;
          top: -9px;
          left: 8px;
          font-size: 10px;
          background: #e2e8f0;
          color: #475569;
          padding: 0 6px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .builder-node__remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #ef4444;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }
        .builder-node:hover .builder-node__remove {
          opacity: 1;
        }
        .builder-node__remove:hover {
          background: #fee2e2;
          border-color: #fecaca;
        }

        .builder-node__content {
          pointer-events: none;
        }

        .tb-preview-viewport {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f8fafc;
        }
        .tb-preview-grid {
          display: grid;
          gap: 16px;
        }
        .tb-preview-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          height: fit-content;
        }
        .tb-card-elevated {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: none;
        }
        .tb-card-minimal {
          border: none;
          background: transparent;
        }
        .tb-card-bordered {
          border: 1px solid #cbd5e1;
        }
        .tb-card-none {
          border: none;
          background: transparent;
          box-shadow: none;
        }

        .tb-prop-group {
          margin-bottom: 12px;
        }
        .tb-prop-group label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 6px;
        }
        .tb-prop-group input,
        .tb-prop-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 13px;
          background: #fff;
        }
        .tb-empty-text {
          font-size: 12px;
          color: #94a3b8;
          padding: 8px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
