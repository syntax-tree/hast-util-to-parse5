import stringify from 'json-stringify-safe'

export function json(value) {
  return JSON.parse(stringify(value))
}
