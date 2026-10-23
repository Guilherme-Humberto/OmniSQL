import type { DatabaseCell, DatabaseForeignKey } from '@/conveyor/database-contracts'

export interface FkTargetInfo {
  targetTable: string
  targetColumn: string
  fromColumn: string
}

export interface FkPeekState {
  isOpen: boolean
  targetTable: string
  targetColumn: string
  value: string | number
  position: { x: number; y: number }
  isLoading: boolean
  error: string | null
  record: Record<string, DatabaseCell> | null
}

export type { DatabaseForeignKey }

