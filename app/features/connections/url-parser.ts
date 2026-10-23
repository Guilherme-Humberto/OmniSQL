import type { ConnectionDraft } from '@/conveyor/connection-contracts'
import {
  DatabaseDriver,
  DEFAULT_DATABASE_PORTS,
  DEFAULT_DATABASE_USERS,
  DEFAULT_DATABASES,
} from '@/app/constants/app-constants'

/**
 * Converte URLs de conexão comuns (PostgreSQL, MySQL, SQLite) em um rascunho de conexão.
 * Segue o princípio de responsabilidade única (SRP), isolando a lógica de parsing de URLs.
 */
export function parseUrlToDraft(urlStr: string): Partial<ConnectionDraft> | null {
  try {
    const url = new URL(urlStr)
    const protocol = url.protocol.replace(':', '').toLowerCase()

    if (protocol === DatabaseDriver.SQLite || protocol === 'file') {
      const path = url.pathname || url.hostname
      return {
        name: path.split('/').pop() || 'SQLite Importado',
        config: { driver: DatabaseDriver.SQLite, path },
      }
    }

    if (protocol === DatabaseDriver.PostgreSQL || protocol === 'postgresql') {
      return {
        name: `[DEV] Postgres ${url.hostname}`,
        config: {
          driver: DatabaseDriver.PostgreSQL,
          host: url.hostname || 'localhost',
          port: url.port ? parseInt(url.port, 10) : DEFAULT_DATABASE_PORTS[DatabaseDriver.PostgreSQL],
          user: url.username || DEFAULT_DATABASE_USERS[DatabaseDriver.PostgreSQL],
          database: url.pathname.replace(/^\//, '') || DEFAULT_DATABASES[DatabaseDriver.PostgreSQL],
          ssl: url.searchParams.get('sslmode') === 'require' || url.searchParams.get('ssl') === 'true',
        },
        password: url.password || '',
      }
    }

    if (protocol === DatabaseDriver.MySQL) {
      return {
        name: `[DEV] MySQL ${url.hostname}`,
        config: {
          driver: DatabaseDriver.MySQL,
          host: url.hostname || 'localhost',
          port: url.port ? parseInt(url.port, 10) : DEFAULT_DATABASE_PORTS[DatabaseDriver.MySQL],
          user: url.username || DEFAULT_DATABASE_USERS[DatabaseDriver.MySQL],
          database: url.pathname.replace(/^\//, '') || DEFAULT_DATABASES[DatabaseDriver.MySQL],
          ssl: false,
        },
        password: url.password || '',
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Formata um timestamp numérico em uma string amigável de tempo relativo.
 */
export function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Nunca usado'

  const diffMs = Date.now() - timestamp
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSec < 60) return 'Agora mesmo'
  if (diffMin < 60) return `${diffMin}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays === 1) return 'Ontem'
  return `${diffDays}d atrás`
}
