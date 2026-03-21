export class ApiError extends Error {
  statusCode: number
  code: string
  details?: unknown

  constructor(opts: { statusCode: number; code: string; message: string; details?: unknown }) {
    super(opts.message)
    this.statusCode = opts.statusCode
    this.code = opts.code
    this.details = opts.details
  }
}

