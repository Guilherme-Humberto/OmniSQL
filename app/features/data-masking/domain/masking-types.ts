import type { DatabaseCell } from '@/conveyor/database-contracts'

export const SensitiveKind = {
  None: 'none',
  Email: 'email',
  CpfCnpj: 'cpf_cnpj',
  Phone: 'phone',
  Password: 'password',
  Name: 'name',
  CreditCard: 'credit_card',
  Address: 'address',
  Generic: 'generic',
} as const
export type SensitiveKind = (typeof SensitiveKind)[keyof typeof SensitiveKind]

export const MaskRule = {
  None: 'none',
  Mask: 'mask',
  Fake: 'fake',
  Hash: 'hash',
  Null: 'null',
  Redact: 'redact',
  FakeEmail: 'fake_email',
  FakeName: 'fake_name',
  FakePhone: 'fake_phone',
  FakeCpf: 'fake_cpf',
  FakeNumber: 'fake_number',
} as const
export type MaskRule = (typeof MaskRule)[keyof typeof MaskRule]

export const ExportFormat = {
  Csv: 'csv',
  Json: 'json',
  Sql: 'sql',
} as const
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat]

export type SensitiveTagsConfig = Record<Exclude<SensitiveKind, 'none'>, string[]>

export interface ColumnMaskConfig {
  columnName: string
  enabled?: boolean
  rule: MaskRule
  sensitiveKind?: SensitiveKind
}

export interface MaskingTransformOptions {
  columns: string[]
  rows: DatabaseCell[][]
  configs: Record<string, ColumnMaskConfig>
}

export interface CsvExportOptions {
  delimiter?: ',' | ';'
  includeHeaders?: boolean
}

export interface SqlExportOptions {
  tableName?: string
}
