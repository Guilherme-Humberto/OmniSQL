import { type ConnectionColor, type ConnectionDraft, type ConnectionDriver } from '@/conveyor/connection-contracts'
import {
  DatabaseDriver,
  DEFAULT_DATABASE_PORTS,
  DEFAULT_DATABASE_USERS,
  DEFAULT_DATABASES,
} from '@/app/constants/app-constants'

export interface ColorMeta {
  hex: string
  bg: string
  border: string
}

export const COLOR_MAP: Record<ConnectionColor, ColorMeta> = {
  slate: { hex: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b' },
  red: { hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '#e11d48' },
  orange: { hex: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: '#ea580c' },
  amber: { hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#d97706' },
  green: { hex: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#059669' },
  teal: { hex: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)', border: '#0d9488' },
  blue: { hex: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: '#2563eb' },
  violet: { hex: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: '#7c3aed' },
  pink: { hex: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: '#db2777' },
}

export interface DriverMetadata {
  id: ConnectionDriver
  name: string
  engine: string
  badge: string
  color: string
  isReady: boolean
  defaultPort?: number
}

export const DRIVER_CATALOG: readonly DriverMetadata[] = [
  {
    id: DatabaseDriver.PostgreSQL,
    name: 'PostgreSQL',
    engine: 'Relacional Avançado',
    badge: 'Nativo',
    color: '#336791',
    isReady: true,
    defaultPort: DEFAULT_DATABASE_PORTS[DatabaseDriver.PostgreSQL],
  },
  {
    id: DatabaseDriver.MySQL,
    name: 'MySQL',
    engine: 'Popular & Alta Performance',
    badge: 'Nativo',
    color: '#00758F',
    isReady: true,
    defaultPort: DEFAULT_DATABASE_PORTS[DatabaseDriver.MySQL],
  },
  {
    id: DatabaseDriver.SQLite,
    name: 'SQLite',
    engine: 'Arquivo Embarcado Local',
    badge: 'Nativo',
    color: '#38bdf8',
    isReady: true,
  },
] as const

export const DEFAULT_DRAFT: ConnectionDraft = {
  name: 'Nova Conexão',
  color: 'orange',
  config: {
    driver: DatabaseDriver.PostgreSQL,
    host: 'localhost',
    port: DEFAULT_DATABASE_PORTS[DatabaseDriver.PostgreSQL],
    user: DEFAULT_DATABASE_USERS[DatabaseDriver.PostgreSQL],
    database: DEFAULT_DATABASES[DatabaseDriver.PostgreSQL],
    ssl: false,
  },
  password: '',
  savePassword: true,
}
