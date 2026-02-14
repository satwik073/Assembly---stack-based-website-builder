'use server'

import curlToPostman from 'curl-to-postmanv2'

export interface ParsedCurl {
  method: string
  url: string
  headers: Array<{ key: string; value: string }>
  body: string
  authType: 'none' | 'bearer' | 'api-key' | 'basic'
  authConfig: {
    bearerToken?: string
    apiKeyName?: string
    apiKeyValue?: string
    basicUsername?: string
    basicPassword?: string
  }
  queryParams: Array<{ key: string; value: string }>
  detectedFormat: 'curl' | 'postman' | 'httpie' | 'raw-http' | 'unknown'
}

export async function parseCurl(curl_string: string): Promise<ParsedCurl> {
  return new Promise((resolve, reject) => {
    try {
      // Basic cleanup of the input string
      const cleaned = curl_string.trim()

      if (!cleaned) {
        reject(new Error('Empty input'))
        return
      }

      curlToPostman.convert(
        { type: 'string', data: cleaned },
        (err: any, result: { result: boolean; output: Array<{ data: any }> }) => {
          if (err) {
            console.error('curl-to-postmanv2 error:', err)
            // Fallback default
            resolve({
              method: 'GET',
              url: '',
              headers: [],
              body: '',
              authType: 'none',
              authConfig: {},
              queryParams: [],
              detectedFormat: 'unknown',
            })
            return
          }

          if (!result.result || !result.output || result.output.length === 0) {
            // Could not parse
            resolve({
              method: 'GET',
              url: '',
              headers: [],
              body: '',
              authType: 'none',
              authConfig: {},
              queryParams: [],
              detectedFormat: 'unknown',
            })
            return
          }

          const request = result.output[0].data

          // initial values
          let method = request.method || 'GET'
          let url = ''
          const headers: Array<{ key: string; value: string }> = []
          let body = ''
          let authType: ParsedCurl['authType'] = 'none'
          const authConfig: ParsedCurl['authConfig'] = {}
          const queryParams: Array<{ key: string; value: string }> = []

          // URL & Query Params
          if (request.url) {
            if (typeof request.url === 'string') {
              url = request.url
            } else {
              url = request.url.raw || ''
              // If url is an object, it might have variables or parsed query
              if (request.url.query && Array.isArray(request.url.query)) {
                request.url.query.forEach((q: any) => {
                  if (q.key) {
                    queryParams.push({ key: q.key, value: q.value || '' })
                  }
                })
              }
            }
          }

          // Headers
          if (request.header && Array.isArray(request.header)) {
            request.header.forEach((h: any) => {
              if (h.key) {
                headers.push({ key: h.key, value: h.value || '' })
              }
            })
          }

          // Body
          if (request.body) {
            if (request.body.mode === 'raw') {
              body = request.body.raw || ''
            } else if (request.body.mode === 'urlencoded') {
              // Convert urlencoded to JSON or keep as string?
              // For now, let's try to stringify if it's an array, or just leave it blank if complicated
              // Ideally we might want to support form data editor, but here we just have a text body
              if (Array.isArray(request.body.urlencoded)) {
                const parts = request.body.urlencoded.map(
                  (item: any) =>
                    `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`,
                )
                body = parts.join('&')
              }
            } else if (request.body.mode === 'formdata') {
              // Formdata is hard to represent in a single string unless we use a boundary
              // Just fallback to empty or description
              if (Array.isArray(request.body.formdata)) {
                // Approximate representation
                body = JSON.stringify(request.body.formdata, null, 2)
              }
            }
          }

          // Auth
          if (request.auth) {
            const type = request.auth.type
            if (type === 'bearer') {
              authType = 'bearer'
              const token = request.auth.bearer?.find((item: any) => item.key === 'token')
              if (token) {
                authConfig.bearerToken = token.value
              }
            } else if (type === 'basic') {
              authType = 'basic'
              const username = request.auth.basic?.find((item: any) => item.key === 'username')
              const password = request.auth.basic?.find((item: any) => item.key === 'password')
              authConfig.basicUsername = username?.value || ''
              authConfig.basicPassword = password?.value || ''
            } else if (type === 'apikey') {
              authType = 'api-key'
              const key = request.auth.apikey?.find((item: any) => item.key === 'key')
              const value = request.auth.apikey?.find((item: any) => item.key === 'value')
              authConfig.apiKeyName = key?.value || ''
              authConfig.apiKeyValue = value?.value || ''
            }
          }

          // Fallback if auth is passed in headers
          // curl-to-postmanv2 extracts auth to .auth object usually, but let's check headers just in case if authType is none
          if (authType === 'none') {
            const authHeaderIndex = headers.findIndex(
              (h) => h.key.toLowerCase() === 'authorization',
            )
            if (authHeaderIndex !== -1) {
              const val = headers[authHeaderIndex].value
              if (val.toLowerCase().startsWith('bearer ')) {
                authType = 'bearer'
                authConfig.bearerToken = val.substring(7).trim()
                headers.splice(authHeaderIndex, 1)
              } else if (val.toLowerCase().startsWith('basic ')) {
                authType = 'basic'
                try {
                  const decoded = atob(val.substring(6).trim())
                  const [u, p] = decoded.split(':')
                  authConfig.basicUsername = u
                  authConfig.basicPassword = p
                } catch (e) {
                  /* ignore */
                }
                headers.splice(authHeaderIndex, 1)
              }
            }
          }

          // Clean up headers (remove auto-generated or noisy ones if desired, though curl-to-postman might handle this)
          // The previous implementation removed 'user-agent' etc. We can keep that logic.
          const noise_prefixes = ['sec-', 'sec-ch-']
          const noise_keys = [
            'user-agent',
            'accept-language',
            'priority',
            'connection',
            'cookie',
            'postman-token',
            'host',
            'content-length',
          ]

          let filteredHeaders = headers.filter((h) => {
            const lower = h.key.toLowerCase()
            return !noise_prefixes.some((p) => lower.startsWith(p)) && !noise_keys.includes(lower)
          })

          resolve({
            method,
            url,
            headers: filteredHeaders,
            body,
            authType,
            authConfig,
            queryParams,
            detectedFormat: 'curl', // Assume curl since we used curl-to-postman
          })
        },
      )
    } catch (e) {
      console.error('Exception in parseCurl', e)
      reject(e)
    }
  })
}
