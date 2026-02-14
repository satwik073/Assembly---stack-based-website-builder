import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const {
      method = 'GET',
      url,
      headers: custom_headers = [],
      authType = 'none',
      authConfig = {},
      queryParams = [],
      body: request_body,
    } = payload as {
      method: string
      url: string
      headers: Array<{ key: string; value: string }>
      authType: string
      authConfig: Record<string, string>
      queryParams: Array<{ key: string; value: string }>
      body?: string
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const target_url = new URL(url)
    for (const param of queryParams) {
      if (param.key && param.value) {
        target_url.searchParams.set(param.key, param.value)
      }
    }

    const fetch_headers: Record<string, string> = {}

    // 1. Process custom headers first
    for (const header of custom_headers) {
      if (header.key && header.value) {
        fetch_headers[header.key] = header.value
      }
    }

    // 2. Handle Authentication
    if (authType === 'bearer' && authConfig.bearerToken) {
      // Overwrite any existing Authorization header
      // We should check for case-insensitive 'authorization' if we wanted to be safe,
      // but usually Authorization is standard. Let's remove any existing one first.
      Object.keys(fetch_headers).forEach((key) => {
        if (key.toLowerCase() === 'authorization') delete fetch_headers[key]
      })
      fetch_headers['Authorization'] = `Bearer ${authConfig.bearerToken}`
    } else if (authType === 'api-key' && authConfig.apiKeyName && authConfig.apiKeyValue) {
      fetch_headers[authConfig.apiKeyName] = authConfig.apiKeyValue
    } else if (authType === 'basic' && authConfig.basicUsername) {
      Object.keys(fetch_headers).forEach((key) => {
        if (key.toLowerCase() === 'authorization') delete fetch_headers[key]
      })
      const credentials = btoa(`${authConfig.basicUsername}:${authConfig.basicPassword ?? ''}`)
      fetch_headers['Authorization'] = `Basic ${credentials}`
    }

    // 3. Handle Content-Type default
    const has_content_type = Object.keys(fetch_headers).some(
      (k) => k.toLowerCase() === 'content-type',
    )

    if (!has_content_type && request_body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetch_headers['Content-Type'] = 'application/json'
    }

    const fetch_options: RequestInit = {
      method,
      headers: fetch_headers,
    }

    if (request_body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      // Ensure body is a string. If it came in as an object (via JSON payload), stringify it.
      // This prevents [object Object] being sent if the frontend payload wasn't fully stringified in the body field.
      fetch_options.body =
        typeof request_body === 'object' ? JSON.stringify(request_body) : String(request_body)
    }

    const start_time = Date.now()
    const response = await fetch(target_url.toString(), fetch_options)
    const elapsed_ms = Date.now() - start_time

    const response_headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      response_headers[key] = value
    })

    let response_data: unknown
    const content_type = response.headers.get('content-type') ?? ''

    if (content_type.includes('application/json')) {
      response_data = await response.json()
    } else {
      const text = await response.text()
      try {
        response_data = JSON.parse(text)
      } catch {
        response_data = { _raw_text: text }
      }
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response_headers,
      data: response_data,
      elapsed_ms,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    )
  }
}
