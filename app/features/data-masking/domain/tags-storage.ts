import { DEFAULT_SENSITIVE_TAGS } from './heuristic-detector'
import type { SensitiveKind, SensitiveTagsConfig } from './masking-types'

const STORAGE_PREFIX = 'sql_editor_sensitive_tags:'

/**
 * Retorna as tags configuradas para o banco/conexão específico.
 * Se nenhuma tag personalizada for encontrada, retorna as tags padrão.
 */
export function getDatabaseSensitiveTags(connectionId?: string): SensitiveTagsConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return structuredClone(DEFAULT_SENSITIVE_TAGS)
  }

  const key = `${STORAGE_PREFIX}${connectionId || 'default'}`
  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return structuredClone(DEFAULT_SENSITIVE_TAGS)
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SensitiveTagsConfig>
    const merged: SensitiveTagsConfig = structuredClone(DEFAULT_SENSITIVE_TAGS)

    for (const [kind, tags] of Object.entries(parsed) as [Exclude<SensitiveKind, 'none'>, string[]][]) {
      if (Array.isArray(tags)) {
        merged[kind] = tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      }
    }

    return merged
  } catch {
    return structuredClone(DEFAULT_SENSITIVE_TAGS)
  }
}

/**
 * Persiste as tags de um banco de dados no armazenamento local.
 */
export function saveDatabaseSensitiveTags(connectionId: string | undefined, tags: SensitiveTagsConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) return

  const key = `${STORAGE_PREFIX}${connectionId || 'default'}`
  window.localStorage.setItem(key, JSON.stringify(tags))
}

/**
 * Restaura as tags de um banco de dados para os valores padrão do sistema.
 */
export function resetDatabaseSensitiveTags(connectionId?: string): SensitiveTagsConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `${STORAGE_PREFIX}${connectionId || 'default'}`
    window.localStorage.removeItem(key)
  }
  return structuredClone(DEFAULT_SENSITIVE_TAGS)
}
