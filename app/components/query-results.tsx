import { AlertCircle, Rows3 } from 'lucide-react'
import styled from 'styled-components'
import type { DatabaseCell } from '@/conveyor/database-contracts'
import type { QueryTab } from './workspace-store'

const Panel = styled.section`
  display: flex;
  min-height: 180px;
  flex: 1;
  flex-direction: column;
  border-top: 1px solid var(--border);
  background: var(--surface);
`

const PanelHeader = styled.header`
  display: flex;
  height: 38px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 12px;
`

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--foreground);
  font-weight: 600;
`

const ScrollArea = styled.div`
  min-height: 0;
  flex: 1;
  overflow: auto;
`

const Table = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
`

const HeaderCell = styled.th`
  position: sticky;
  z-index: 1;
  top: 0;
  min-width: 150px;
  padding: 8px 12px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
  color: var(--foreground-muted);
  font-size: 11px;
  font-weight: 600;
  text-align: left;
`

const DataCell = styled.td<{ $null: boolean }>`
  max-width: 360px;
  padding: 7px 12px;
  overflow: hidden;
  border-right: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
  color: ${({ $null }) => ($null ? 'var(--foreground-subtle)' : 'var(--foreground)')};
  text-overflow: ellipsis;
  white-space: nowrap;
`

const EmptyState = styled.div`
  display: flex;
  height: 100%;
  min-height: 132px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--foreground-muted);
  font-size: 12px;
`

const ErrorState = styled(EmptyState)`
  color: var(--danger);
`

const Footer = styled.footer`
  display: flex;
  height: 30px;
  flex: none;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  border-top: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 11px;
`

interface QueryResultsProps {
  tab: QueryTab
}

export function QueryResults({ tab }: QueryResultsProps) {
  const result = tab.result

  return (
    <Panel aria-label="Resultados da consulta">
      <PanelHeader>
        <PanelTitle>
          <Rows3 size={14} />
          Resultados
        </PanelTitle>
        {result && <span>{result.columns.length ? `${result.columns.length} colunas` : 'Comando SQL'}</span>}
      </PanelHeader>
      <ScrollArea>
        {tab.error ? (
          <ErrorState>
            <AlertCircle size={18} />
            <span>{tab.error}</span>
          </ErrorState>
        ) : !result ? (
          <EmptyState>
            <Rows3 size={18} />
            <span>Nenhum resultado nesta consulta.</span>
          </EmptyState>
        ) : result.columns.length ? (
          <Table>
            <thead>
              <tr>
                <HeaderCell>#</HeaderCell>
                {result.columns.map((column, index) => (
                  <HeaderCell key={`${column}-${index}`}>{column}</HeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <DataCell $null={false}>{rowIndex + 1}</DataCell>
                  {row.map((value, columnIndex) => (
                    <DataCell key={columnIndex} $null={value === null} title={formatCell(value)}>
                      {formatCell(value)}
                    </DataCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            <Rows3 size={18} />
            <span>Comando concluído.</span>
          </EmptyState>
        )}
      </ScrollArea>
      {result && (
        <Footer>
          <span>{result.affectedRows.toLocaleString('pt-BR')} linhas</span>
          <span>{result.durationMs.toFixed(1)} ms</span>
          {result.truncated && <span>Exibindo as primeiras 1.000 linhas</span>}
        </Footer>
      )}
    </Panel>
  )
}

function formatCell(value: DatabaseCell): string {
  if (value === null) return 'NULL'
  if (typeof value === 'object') return `BLOB (${atob(value.base64).length} bytes)`
  return String(value)
}
