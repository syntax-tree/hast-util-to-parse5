import stringify from 'json-stringify-safe'

/**
 * @param {unknown} value
 * @returns {unknown}
 */
export function json(value) {
  return JSON.parse(stringify(value))
}
