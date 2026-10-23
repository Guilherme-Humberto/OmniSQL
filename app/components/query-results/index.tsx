import { useMemo, useState } from 'react'
import { AlertCircle, BarChart3, Code2, Link2, Rows3, ShieldCheck } from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import type { DatabaseCell } from '@/conveyor/database-contracts'
import { QueryChart } from '../query-chart'
import type { QueryTab } from '../workspace-store'
import { useModifierKey } from '@/app/features/fk-navigation/hooks/use-modifier-key'
import { resolveForeignKeyTarget } from '@/app/features/fk-navigation/domain/foreign-key-resolver'
import { FkPeekOverlay } from '@/app/features/fk-navigation/components/fk-peek-overlay'
import { ExportMaskingModal } from '@/app/features/data-masking/components/export-masking-modal'
import { QueryResultViewMode } from '@/app/constants/app-constants'
import {
  Panel,
  PanelHeader,
  ViewTabs,
  ViewTabButton,
  PanelInfo,
  HeaderButton,
  ScrollArea,
  Table,
  HeaderCell,
  HeaderContent,
  FkBadge,
  DataCell,
  EmptyState,
  ErrorState,
  Footer,
} from './styles'

interface QueryResultsProps {
  tab: QueryTab
  connectionId?: string
  availableTables?: string[]
  onGenerateCode?: () => void
  onOpenInNewTab?: (sql: string) => void
}

interface ActivePeekTarget {
  targetTable: string
  targetColumn: string
  value: string | number
}

/**
 * Painel de resultados da consulta SQL com suporte a visualização em grade,
 * mini-dashboard analítico e navegação de Chaves Estrangeiras (Peek Overlay estilo IDE).
 */
export function QueryResults({
  tab,
  connectionId,
  availableTables,
  onGenerateCode,
  onOpenInNewTab,
}: QueryResultsProps) {
  const result = tab.result
  const [viewMode, setViewMode] = useState<QueryResultViewMode>(QueryResultViewMode.Table)
  const [peekTarget, setPeekTarget] = useState<ActivePeekTarget | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Detecta se a tecla modificadora (Ctrl ou Cmd) está pressionada
  const isModifierActive = useModifierKey()

  // Consulta as chaves estrangeiras cadastradas no catálogo do banco ativo
  const { data: foreignKeysByTable } = conveyor.database.foreignKeys.useQuery({
    input: connectionId ?? '',
    enabled: Boolean(connectionId),
  })

  // Mapeia cada coluna para seu alvo de chave estrangeira (se existir)
  const fkTargetsByColumn = useMemo(() => {
    if (!result?.columns) return {}
    const map: Record<string, ReturnType<typeof resolveForeignKeyTarget>> = {}

    for (const column of result.columns) {
      map[column] = resolveForeignKeyTarget(column, foreignKeysByTable, availableTables)
    }

    return map
  }, [result?.columns, foreignKeysByTable, availableTables])

  // Identifica o nome da tabela consultada a partir da consulta SQL
  const derivedTableName = useMemo(() => {
    const match = tab.sql.match(/FROM\s+["`]?([a-zA-Z0-9_]+)["`]?/i)
    if (match && match[1]) return match[1]
    return tab.title ? tab.title.replace(/\.[^/.]+$/, '') : 'consulta'
  }, [tab.sql, tab.title])

  const handleCellClick = (columnName: string, value: DatabaseCell) => {
    if (value === null || typeof value === 'object' || !connectionId) return
    const target = fkTargetsByColumn[columnName]
    if (!target) return

    setPeekTarget({
      targetTable: target.targetTable,
      targetColumn: target.targetColumn,
      value,
    })
  }

  return (
    <Panel aria-label="Resultados da consulta">
      <PanelHeader>
        <ViewTabs>
          <ViewTabButton
            type="button"
            $active={viewMode === QueryResultViewMode.Table}
            onClick={() => setViewMode(QueryResultViewMode.Table)}
          >
            <Rows3 size={13} />
            <span>Tabela</span>
          </ViewTabButton>
          <ViewTabButton
            type="button"
            $active={viewMode === QueryResultViewMode.Chart}
            onClick={() => setViewMode(QueryResultViewMode.Chart)}
            disabled={!result || !result.rows.length}
            title={
              !result || !result.rows.length
                ? 'Execute uma consulta com dados para visualizar gráficos'
                : 'Visualizar como Gráfico'
            }
          >
            <BarChart3 size={13} />
            <span>Gráficos</span>
          </ViewTabButton>
        </ViewTabs>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {result && (
            <PanelInfo>
              <span>{result.columns.length ? `${result.columns.length} colunas` : 'Comando SQL'}</span>
              <span>·</span>
              <span>{result.affectedRows.toLocaleString('pt-BR')} linhas</span>
            </PanelInfo>
          )}

          {onGenerateCode && (
            <HeaderButton
              type="button"
              onClick={onGenerateCode}
              title="Gerar código ORM e APIs a partir da consulta e resultado"
            >
              <Code2 size={13} />
              <span>Gerar Código</span>
            </HeaderButton>
          )}

          {result && result.rows.length > 0 && (
            <HeaderButton
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              title="Exportar dados com mascaramento inteligente LGPD / GDPR"
            >
              <ShieldCheck size={13} color="#10b981" />
              <span>Exportar</span>
            </HeaderButton>
          )}
        </div>
      </PanelHeader>

      {tab.error ? (
        <ScrollArea>
          <ErrorState>
            <AlertCircle size={18} />
            <span>{tab.error}</span>
          </ErrorState>
        </ScrollArea>
      ) : !result ? (
        <ScrollArea>
          <EmptyState>
            <Rows3 size={18} />
            <span>Nenhum resultado nesta consulta.</span>
          </EmptyState>
        </ScrollArea>
      ) : viewMode === QueryResultViewMode.Chart && result.columns.length ? (
        <QueryChart result={result} />
      ) : result.columns.length ? (
        <ScrollArea>
          <Table>
            <thead>
              <tr>
                <HeaderCell>#</HeaderCell>
                {result.columns.map((column, index) => {
                  const fk = fkTargetsByColumn[column]
                  return (
                    <HeaderCell key={`${column}-${index}`}>
                      <HeaderContent>
                        <span>{column}</span>
                        {fk && (
                          <FkBadge title={`Chave Estrangeira: aponta para ${fk.targetTable}(${fk.targetColumn})`}>
                            <Link2 size={9} style={{ marginRight: 2 }} />
                            FK
                          </FkBadge>
                        )}
                      </HeaderContent>
                    </HeaderCell>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <DataCell $null={false}>{rowIndex + 1}</DataCell>
                  {row.map((value, columnIndex) => {
                    const columnName = result.columns[columnIndex] || ''
                    const fk = fkTargetsByColumn[columnName]
                    const isFk = Boolean(fk && value !== null)
                    const cellFormatted = formatCell(value)

                    return (
                      <DataCell
                        key={columnIndex}
                        $null={value === null}
                        $isFk={isFk}
                        $isModifierActive={isModifierActive}
                        title={
                          isFk
                            ? `${cellFormatted} (Clique para espiar dados em ${fk?.targetTable})`
                            : cellFormatted
                        }
                        onClick={() => handleCellClick(columnName, value)}
                      >
                        {cellFormatted}
                      </DataCell>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      ) : (
        <ScrollArea>
          <EmptyState>
            <Rows3 size={18} />
            <span>Comando concluído.</span>
          </EmptyState>
        </ScrollArea>
      )}

      {result && (
        <Footer>
          <span>{result.affectedRows.toLocaleString('pt-BR')} linhas</span>
          <span>{result.durationMs.toFixed(1)} ms</span>
          {result.truncated && <span>Exibindo as primeiras 1.000 linhas</span>}
        </Footer>
      )}

      {peekTarget && connectionId && (
        <FkPeekOverlay
          connectionId={connectionId}
          targetTable={peekTarget.targetTable}
          targetColumn={peekTarget.targetColumn}
          value={peekTarget.value}
          onClose={() => setPeekTarget(null)}
          onOpenInNewTab={(sql) => {
            if (onOpenInNewTab) onOpenInNewTab(sql)
          }}
        />
      )}

      {isExportModalOpen && result && (
        <ExportMaskingModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          columns={result.columns}
          rows={result.rows}
          tableName={derivedTableName}
          connectionId={connectionId}
        />
      )}
    </Panel>
  )
}

function formatCell(value: DatabaseCell): string {
  if (value === null) return 'NULL'
  if (typeof value === 'object') return `BLOB (${atob(value.base64).length} bytes)`
  return String(value)
}

