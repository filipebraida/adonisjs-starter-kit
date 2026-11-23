const REDACTED = '[redacted]'

// Field names that never reach a log line, at the root of the line or one level
// below: credentials and the headers that carry them, plus the e-mail as the
// personal datum every app has.
const SENSITIVE_FIELDS = [
  'password',
  'passwordConfirmation',
  'password_confirmation',
  'token',
  'secret',
  'authorization',
  'cookie',
  'email',
]

/**
 * Pino options that keep credentials and personal data out of the log whatever
 * code wrote the line. A safety net: the app itself logs only identifiers.
 */
export const logRedaction = {
  redact: {
    paths: [
      ...SENSITIVE_FIELDS,
      ...SENSITIVE_FIELDS.map((field) => `*.${field}`),
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: REDACTED,
  },
}
