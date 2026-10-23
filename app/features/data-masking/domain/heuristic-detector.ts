import type { DatabaseCell } from '@/conveyor/database-contracts'
import type { SensitiveKind, SensitiveTagsConfig } from './masking-types'

export const DEFAULT_SENSITIVE_TAGS: SensitiveTagsConfig = {
  email: ['email', 'e_mail', 'mail', 'contato_email'],
  cpf_cnpj: ['cpf', 'cnpj', 'documento', 'doc_identidade', 'nr_cpf', 'cnpj_empresa'],
  phone: ['telefone', 'celular', 'phone', 'tel', 'mobile', 'whatsapp', 'fone'],
  password: ['senha', 'password', 'passwd', 'pwd', 'token', 'secret', 'pin'],
  name: ['nome', 'name', 'full_name', 'razao_social', 'sobrenome', 'first_name', 'last_name'],
  credit_card: ['cartao', 'credit_card', 'card_number', 'cvv', 'card'],
  address: ['endereco', 'address', 'rua', 'street', 'bairro', 'cep', 'zipcode', 'postal_code'],
  generic: ['rg', 'cnh', 'titulo_eleitor', 'salario', 'salary', 'renda', 'birth_date', 'data_nascimento', 'pix'],
}

const EMAIL_VALUE_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CPF_VALUE_REGEX = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/
const PHONE_VALUE_REGEX = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/

/**
 * Avalia se o nome de uma coluna corresponde a uma tag de texto,
 * respeitando delimitadores comuns (snake_case, kebab-case, camelCase, espaços).
 * Ex: tag 'cpf' casa com 'nr_cpf', 'cpf_cliente', 'cpf', 'userCpf'.
 */
export function matchesColumnTag(columnName: string, tag: string): boolean {
  const col = columnName.trim().toLowerCase()
  const t = tag.trim().toLowerCase()
  if (!t || !col) return false
  if (col === t) return true

  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const boundaryRegex = new RegExp(`(^|[_\\.\\s-]|[a-z](?=[A-Z]))${escaped}([_\\.\\s-]|[A-Z]|$)`, 'i')
  return boundaryRegex.test(columnName)
}

/**
 * Detecta se uma coluna contém dados pessoais identificáveis (PII) segundo critérios LGPD/GDPR.
 * Utiliza o sistema de tags configurável por banco de dados.
 */
export function detectSensitiveKind(
  columnName: string,
  sampleValues?: DatabaseCell[],
  tagsConfig?: SensitiveTagsConfig
): SensitiveKind {
  const activeTags = tagsConfig ?? DEFAULT_SENSITIVE_TAGS

  // 1. Checagem dinâmica baseada nas tags configuradas por categoria
  for (const [kind, tags] of Object.entries(activeTags) as [Exclude<SensitiveKind, 'none'>, string[]][]) {
    if (!tags || tags.length === 0) continue
    for (const tag of tags) {
      if (matchesColumnTag(columnName, tag)) {
        return kind
      }
    }
  }

  // 2. Checagem heurística por formato dos valores (se houver amostra de dados)
  if (sampleValues && sampleValues.length > 0) {
    for (const val of sampleValues) {
      if (val === null || typeof val === 'object') continue
      const strVal = String(val).trim()
      if (!strVal) continue

      if (EMAIL_VALUE_REGEX.test(strVal)) return 'email'
      if (CPF_VALUE_REGEX.test(strVal)) return 'cpf_cnpj'
      if (PHONE_VALUE_REGEX.test(strVal)) return 'phone'
    }
  }

  return 'none'
}
