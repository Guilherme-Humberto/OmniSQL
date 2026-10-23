import type { DatabaseCell } from '@/conveyor/database-contracts'
import type { ColumnMaskConfig } from './masking-types'

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

/**
 * Aplica hashing determinístico rápido (FNV-1a 32-bit expandido para hex)
 * dispensando módulos nativos ou bibliotecas criptográficas pesadas.
 */
export function hashString(input: string): string {
  let hash1 = 0x811c9dc5
  let hash2 = 0x811c9dc5 ^ 0x5a5a5a5a

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i)
    hash1 ^= charCode
    hash1 = Math.imul(hash1, 0x01000193)
    hash2 ^= charCode
    hash2 = Math.imul(hash2, 0x01000193)
  }

  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0')
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0')
  return `${hex1}${hex2}`.slice(0, 10)
}

/**
 * Mascara e-mails preservando o primeiro e último caractere do usuário e o domínio.
 * Ex: joao.silva@exemplo.com.br -> j*********a@exemplo.com.br
 */
export function maskEmail(email: string): string {
  const parts = email.split('@')
  if (parts.length !== 2) return maskGeneric(email)

  const [user, domain] = parts
  if (!user || !domain) return '***@***.com'

  if (user.length <= 2) {
    return `${user[0]}*@${domain}`
  }

  const maskedUser = `${user[0]}${'*'.repeat(Math.min(user.length - 2, 8))}${user[user.length - 1]}`
  return `${maskedUser}@${domain}`
}

/**
 * Mascara CPFs ou CNPJs mantendo apenas prefixo ou dígitos verificadores.
 * Ex: 123.456.789-01 -> 123.***.***-01
 */
export function maskCpfCnpj(doc: string): string {
  const digits = doc.replace(/\D/g, '')

  // CPF (11 dígitos)
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`
  }

  // CNPJ (14 dígitos)
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/****-${digits.slice(12)}`
  }

  return maskGeneric(doc)
}

/**
 * Mascara números de telefone mantendo DDD e final.
 * Ex: (11) 98765-4321 -> (11) 9****-4321
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    const ddd = digits.slice(0, 2)
    const end = digits.slice(-4)
    return `(${ddd}) 9****-${end}`
  }
  return maskGeneric(phone)
}

/**
 * Mascara nomes próprios preservando as iniciais.
 * Ex: Guilherme Santos Silva -> G******** S***** S****
 */
export function maskName(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word
      return `${word[0]}${'*'.repeat(Math.max(1, word.length - 1))}`
    })
    .join(' ')
}

/**
 * Mascara números de cartão de crédito exibindo apenas os últimos 4 dígitos.
 */
export function maskCreditCard(card: string): string {
  const digits = card.replace(/\D/g, '')
  if (digits.length >= 12) {
    return `**** **** **** ${digits.slice(-4)}`
  }
  return '**** **** **** ****'
}

/**
 * Mascara genérica para dados confidenciais.
 */
export function maskGeneric(value: string): string {
  if (value.length <= 2) return '**'
  return `${value[0]}${'*'.repeat(Math.min(value.length - 2, 6))}${value[value.length - 1]}`
}

/**
 * Gera dados sintéticos consistentes para qualquer coluna ou tipo de regra.
 * Suporta regras semânticas (email, documento, telefone, nome) e também qualquer
 * coluna arbitrária do usuário gerando `<nome_coluna>_anon_<índice>`.
 */
export function generateFakeValue(
  fieldOrKind: string,
  rowIndex: number,
  columnName?: string
): string {
  const index = rowIndex + 1
  const target = (fieldOrKind || '').toLowerCase()

  if (target === 'email' || target === MaskRule.FakeEmail) {
    return `usuario_anon_${index}@exemplo.local`
  }
  if (target === 'cpf_cnpj' || target === MaskRule.FakeCpf) {
    const padded = String(index).padStart(9, '0')
    return `${padded.slice(0, 3)}.${padded.slice(3, 6)}.${padded.slice(6, 9)}-00`
  }
  if (target === 'phone' || target === MaskRule.FakePhone) {
    const padded = String(index).padStart(4, '0')
    return `(11) 99000-${padded}`
  }
  if (target === 'name' || target === MaskRule.FakeName) {
    return `Pessoa Anonimizada ${index}`
  }
  if (target === 'credit_card') {
    return `4000 0000 0000 ${String(index).padStart(4, '0')}`
  }
  if (target === 'password') {
    return '[SENHA_REMOVIDA]'
  }
  if (target === 'address') {
    return `Rua Exemplo Fictícia, ${index}`
  }
  if (target === MaskRule.FakeNumber) {
    return String(1000 + index)
  }

  // Qualquer campo genérico do usuário (ex: salario, status, observacao, etc.)
  const label = columnName || (fieldOrKind !== 'generic' && fieldOrKind !== 'fake' ? fieldOrKind : 'anon')
  return `${label}_anon_${index}`
}

/**
 * Aplica a regra de anonimização sobre uma célula individual para qualquer campo.
 */
export function maskCell(
  value: DatabaseCell,
  rule: MaskRule,
  columnNameOrKind: string = '',
  rowIndex: number = 0
): DatabaseCell {
  if (value === null) return null
  if (rule === MaskRule.None) return value
  if (rule === MaskRule.Null) return null
  if (rule === MaskRule.Redact) return '[ANONIMIZADO]'

  // BLOBs
  if (typeof value === 'object') {
    if (rule === MaskRule.Hash) return hashString(value.base64)
    return '[BLOB_ANONIMIZADO]'
  }

  const str = String(value)

  if (rule === MaskRule.Hash) {
    return hashString(str)
  }

  if (rule === MaskRule.FakeNumber) {
    return 1000 + rowIndex + 1
  }

  if (rule === MaskRule.FakeEmail) {
    return `usuario_anon_${rowIndex + 1}@exemplo.local`
  }

  if (rule === MaskRule.FakeName) {
    return `Pessoa Anonimizada ${rowIndex + 1}`
  }

  if (rule === MaskRule.FakePhone) {
    const padded = String(rowIndex + 1).padStart(4, '0')
    return `(11) 99000-${padded}`
  }

  if (rule === MaskRule.FakeCpf) {
    const padded = String(rowIndex + 1).padStart(9, '0')
    return `${padded.slice(0, 3)}.${padded.slice(3, 6)}.${padded.slice(6, 9)}-00`
  }

  if (rule === MaskRule.Fake) {
    return generateFakeValue(columnNameOrKind, rowIndex, columnNameOrKind)
  }

  // Regra 'mask' (mascaramento de caracteres para qualquer campo)
  if (rule === MaskRule.Mask) {
    if (columnNameOrKind === 'password') {
      return '********'
    }
    if (columnNameOrKind === 'name') {
      return maskName(str)
    }
    if (columnNameOrKind === 'email' || str.includes('@')) {
      return maskEmail(str)
    }
    if (columnNameOrKind === 'cpf_cnpj' || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(str.trim())) {
      return maskCpfCnpj(str)
    }
    if (columnNameOrKind === 'phone' || /^\(?\d{2}\)?\s*9?\d{4}-?\d{4}$/.test(str.trim())) {
      return maskPhone(str)
    }
    if (columnNameOrKind === 'credit_card') {
      return maskCreditCard(str)
    }
    if (str.trim().includes(' ') && !/\d/.test(str)) {
      return maskName(str)
    }
    return maskGeneric(str)
  }

  return maskGeneric(str)
}

/**
 * Transforma uma matriz completa de linhas aplicando as regras configuradas pelo usuário para cada coluna.
 * Colunas não marcadas (enabled: false ou rule: 'none') são mantidas 100% originais.
 */
export function transformRowsWithMasking(
  columns: string[],
  rows: DatabaseCell[][],
  configs: Record<string, ColumnMaskConfig>
): DatabaseCell[][] {
  return rows.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const colName = columns[colIndex]
      if (!colName) return cell

      const config = configs[colName]
      if (!config) return cell
      if (config.enabled === false) return cell
      if (config.rule === MaskRule.None) return cell

      const identifier = config.sensitiveKind && config.sensitiveKind !== 'none'
        ? config.sensitiveKind
        : colName

      return maskCell(cell, config.rule, identifier, rowIndex)
    })
  )
}

