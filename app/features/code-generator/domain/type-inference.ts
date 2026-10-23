import type { DatabaseCell } from '@/conveyor/database-contracts'

export function inferTypeScriptType(sampleVal: DatabaseCell): string {
  if (sampleVal === null) return 'string | null'
  if (typeof sampleVal === 'number') return 'number'
  if (typeof sampleVal === 'boolean') return 'boolean'
  if (typeof sampleVal === 'object') return 'Buffer'
  return 'string'
}

export function inferPythonType(sampleVal: DatabaseCell): string {
  if (sampleVal === null) return 'Optional[str] = None'
  if (typeof sampleVal === 'number') return Number.isInteger(sampleVal) ? 'int' : 'float'
  if (typeof sampleVal === 'boolean') return 'bool'
  if (typeof sampleVal === 'object') return 'bytes'
  return 'str'
}

export function inferCSharpType(sampleVal: DatabaseCell): string {
  if (sampleVal === null) return 'string?'
  if (typeof sampleVal === 'number') return Number.isInteger(sampleVal) ? 'int' : 'double'
  if (typeof sampleVal === 'boolean') return 'bool'
  if (typeof sampleVal === 'object') return 'byte[]'
  return 'string'
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

export function toPascalCase(str: string): string {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

