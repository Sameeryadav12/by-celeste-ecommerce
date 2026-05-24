export type ApiErrorPayload = {
  code: string
  message: string
  details?: {
    formErrors?: string[]
    fieldErrors?: Record<string, string[]>
  }
}

export class ApiRequestError extends Error {
  code: string
  details?: ApiErrorPayload['details']

  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiRequestError'
    this.code = payload.code
    this.details = payload.details
  }
}

/** Maps Zod flatten fieldErrors from the API into a single message per field. */
export function fieldErrorsFromApi(
  details: ApiErrorPayload['details'] | undefined,
): Record<string, string> | null {
  const fieldErrors = details?.fieldErrors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null

  const out: Record<string, string> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages[0]) {
      out[key] = messages[0]
    }
  }
  return Object.keys(out).length > 0 ? out : null
}
