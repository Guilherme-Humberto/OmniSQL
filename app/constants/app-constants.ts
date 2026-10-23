/**
 * Enum com os motores de banco de dados suportados pelo SQL Editor.
 */
export enum DatabaseDriver {
  SQLite = 'sqlite',
  PostgreSQL = 'postgres',
  MySQL = 'mysql',
  DuckDB = 'duckdb',
}

/**
 * Modos de execução de consultas no Workspace.
 */
export enum QueryExecutionEngine {
  Direct = 'direct',
  CrossDatabase = 'cross_db',
}

/**
 * Tipos de entidades relacionais no esquema.
 */
export enum DatabaseEntityKind {
  Table = 'table',
  View = 'view',
}

/**
 * Modos de manipulação de arquivos de banco SQLite.
 */
export enum SQLiteFileMode {
  Open = 'open',
  Create = 'create',
}

/**
 * Telas principais da aplicação.
 */
export enum AppView {
  Connections = 'connections',
  Workspace = 'workspace',
}

/**
 * Modos de visualização dos resultados da consulta SQL.
 */
export enum QueryResultViewMode {
  Table = 'table',
  Chart = 'chart',
}

/**
 * Modos de visualização de gráficos analíticos.
 */
export enum ChartType {
  Bar = 'bar',
  Line = 'line',
  Pie = 'pie',
}

/**
 * Modos de tema visual da aplicação.
 */
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

/**
 * Alvos de geração de código ORM e APIs.
 */
export enum CodeTarget {
  Prisma = 'prisma',
  Drizzle = 'drizzle',
  TypeORM = 'typeorm',
  SQLAlchemy = 'sqlalchemy',
  EFCore = 'efcore',
  NextJsApi = 'nextjs_api',
}

/**
 * Portas de conexão padrão por motor.
 */
export const DEFAULT_DATABASE_PORTS = {
  [DatabaseDriver.PostgreSQL]: 5432,
  [DatabaseDriver.MySQL]: 3306,
} as const

/**
 * Usuários de conexão padrão por motor.
 */
export const DEFAULT_DATABASE_USERS = {
  [DatabaseDriver.PostgreSQL]: 'postgres',
  [DatabaseDriver.MySQL]: 'root',
} as const

/**
 * Bancos de dados padrão por motor.
 */
export const DEFAULT_DATABASES = {
  [DatabaseDriver.PostgreSQL]: 'postgres',
  [DatabaseDriver.MySQL]: '',
} as const

/**
 * Limites e constantes operacionais do editor.
 */
export const APP_LIMITS = {
  MAX_QUERY_STRING_LENGTH: 100_000,
  MAX_QUERY_RESULTS_DISPLAY: 1_000,
  MAX_CHART_POINTS: 60,
  MAX_PIE_SLICES: 10,
  MAX_RECENTS_COUNT: 8,
  COLUMN_TYPE_SAMPLE_SIZE: 20,
  NUMERIC_HIT_RATIO_THRESHOLD: 0.75,
} as const

/**
 * Timeouts e durações de animação (em ms).
 */
export const UI_TIMEOUTS = {
  COPY_FEEDBACK_MS: 2_000,
  TEST_RESULT_RESET_MS: 5_000,
  TRANSITION_DURATION_MS: 220,
} as const

/**
 * Dimensões e espaçamentos padrão de renderização gráfica.
 */
export const CHART_DIMENSIONS = {
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 240,
  MIN_WIDTH: 100,
  MIN_HEIGHT: 80,
  PADDING: {
    TOP: 20,
    RIGHT: 20,
    BOTTOM: 40,
    LEFT: 55,
  },
} as const

