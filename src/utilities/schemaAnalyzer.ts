export interface SchemaNode {
  path: string
  key: string
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  children?: SchemaNode[]
  item_type?: string
  sample_value?: unknown
  is_iterable: boolean
}

function detect_type(value: unknown): SchemaNode['type'] {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'string'
}

function truncate_sample(value: unknown): unknown {
  if (typeof value === 'string' && value.length > 80) {
    return value.substring(0, 80) + '…'
  }
  return value
}

export function analyzeSchema(data: unknown, path: string = '', key: string = 'root'): SchemaNode {
  const type = detect_type(data)

  const node: SchemaNode = {
    path,
    key,
    type,
    is_iterable: false,
  }

  if (type === 'array') {
    const arr = data as unknown[]
    node.is_iterable = true
    node.sample_value = `Array(${arr.length})`

    if (arr.length > 0) {
      const first_item = arr[0]
      const item_type = detect_type(first_item)
      node.item_type = item_type

      if (item_type === 'object' && first_item && typeof first_item === 'object') {
        const item_path = path ? `${path}[0]` : '[0]'
        node.children = Object.keys(first_item as Record<string, unknown>).map((child_key) => {
          const child_path = item_path ? `${item_path}.${child_key}` : child_key
          return analyzeSchema(
            (first_item as Record<string, unknown>)[child_key],
            child_path,
            child_key,
          )
        })
      } else {
        node.item_type = item_type
        node.sample_value = `Array(${arr.length}) of ${item_type}`
      }
    }
  } else if (type === 'object') {
    const obj = data as Record<string, unknown>
    const keys = Object.keys(obj)
    node.children = keys.map((child_key) => {
      const child_path = path ? `${path}.${child_key}` : child_key
      return analyzeSchema(obj[child_key], child_path, child_key)
    })
    node.sample_value = `{${keys.length} keys}`
  } else {
    node.sample_value = truncate_sample(data)
  }

  return node
}

export function findIterableArrays(schema: SchemaNode, result: SchemaNode[] = []): SchemaNode[] {
  if (schema.is_iterable && schema.item_type === 'object') {
    result.push(schema)
  }
  if (schema.children) {
    for (const child of schema.children) {
      findIterableArrays(child, result)
    }
  }
  return result
}

export function getValueAtPath(data: unknown, path: string): unknown {
  if (!path || path === '') return data

  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current: unknown = data

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10)
      if (isNaN(index)) return undefined
      current = current[index]
    } else {
      current = (current as Record<string, unknown>)[segment]
    }
  }

  return current
}

export function flattenFields(
  schema: SchemaNode,
  prefix: string = '',
): Array<{ path: string; key: string; type: string }> {
  const fields: Array<{ path: string; key: string; type: string }> = []

  if (schema.children) {
    for (const child of schema.children) {
      const full_path = prefix ? `${prefix}.${child.key}` : child.key
      if (child.type === 'object' && child.children) {
        fields.push(...flattenFields(child, full_path))
      } else {
        fields.push({
          path: full_path,
          key: child.key,
          type: child.type,
        })
      }
    }
  }

  return fields
}
