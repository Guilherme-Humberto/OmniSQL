import type { DatabaseCell, DatabaseQueryResult } from '@/conveyor/database-contracts'
import { APP_LIMITS } from '@/app/constants/app-constants'
import type { ChartDataPoint, ChartStats } from './types'

export function isNumericValue(val: DatabaseCell): boolean {
  if (typeof val === 'number') return true
  if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true
  return false
}

export function parseNumber(val: DatabaseCell): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }
  return 0
}

export function formatNumber(val: number): string {
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}k`
  return val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

/**
 * Analisa as colunas retornadas pela query para identificar candidatas a métrica numérica ou categoria.
 */
export function detectColumnRoles(result: DatabaseQueryResult): {
  numericColumns: string[]
  labelColumns: string[]
} {
  const numericColumns: string[] = []
  const labelColumns: string[] = []

  for (let c = 0; c < result.columns.length; c++) {
    const colName = result.columns[c]
    let numericHits = 0
    const sampleSize = Math.min(result.rows.length, APP_LIMITS.COLUMN_TYPE_SAMPLE_SIZE)
    for (let r = 0; r < sampleSize; r++) {
      if (isNumericValue(result.rows[r][c])) numericHits++
    }
    if (sampleSize > 0 && numericHits / sampleSize >= APP_LIMITS.NUMERIC_HIT_RATIO_THRESHOLD) {
      numericColumns.push(colName)
    } else {
      labelColumns.push(colName)
    }
  }

  return { numericColumns, labelColumns }
}

/**
 * Converte as linhas do resultado SQL em pontos de dados estruturados para o gráfico.
 */
export function extractChartData(
  result: DatabaseQueryResult,
  xAxisCol: string,
  yAxisCol: string,
  maxPoints = APP_LIMITS.MAX_CHART_POINTS
): ChartDataPoint[] {
  const xIndex = result.columns.indexOf(xAxisCol)
  const yIndex = result.columns.indexOf(yAxisCol)
  if (xIndex === -1 || yIndex === -1) return []

  const rows = result.rows.slice(0, maxPoints)

  return rows.map((row, idx) => {
    const rawX = row[xIndex]
    const rawY = row[yIndex]
    const label = rawX === null ? 'NULL' : String(rawX)
    const value = parseNumber(rawY)
    return { id: idx, label, value }
  })
}

/**
 * Calcula métricas resumidas dos pontos de dados (Total, Média, Máximo, Mínimo).
 */
export function calculateStats(data: ChartDataPoint[]): ChartStats | null {
  if (!data.length) return null
  const values = data.map((d) => d.value)
  const total = values.reduce((sum, v) => sum + v, 0)
  const avg = total / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)
  return { count: data.length, total, avg, max, min }
}

