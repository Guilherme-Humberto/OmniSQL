import { useState } from 'react'
import { Circle, Play, Plus, Square, X } from 'lucide-react'
import styled from 'styled-components'
import { conveyor } from '@/conveyor/client'
import type { DatabaseConnection, DatabaseTable } from '@/conveyor/database-contracts'
import { useWindowStore } from '../shell/window-store'
import { DatabaseSidebar } from './database-sidebar'
import { QueryResults } from './query-results'
import { SqlEditor } from './sql-editor'
import { useWorkspaceStore } from './workspace-store'

const Layout = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  grid-template-columns: 248px minmax(0, 1fr);

  @media (max-width: 760px) {
    grid-template-columns: 190px minmax(0, 1fr);
  }
`

const Main = styled.main`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: var(--background);
`

const Toolbar = styled.header`
  display: flex;
  min-height: 44px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
`

const Location = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: var(--foreground-muted);
  font-size: 11px;
`

const LocationName = styled.strong`
  max-width: 260px;
  overflow: hidden;
  color: var(--foreground);
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ConnectionSelect = styled.select`
  width: min(190px, 22vw);
  height: 29px;
  padding: 0 26px 0 9px;
  border: 1px solid var(--border);
  border-radius: 4px;
  outline: 0;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;

  &:focus-visible {
    border-color: var(--brand);
  }
`

const RunButton = styled.button`
  display: inline-flex;
  height: 29px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 1px solid var(--brand);
  border-radius: 4px;
  background: var(--brand);
  color: #1b100d;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.06);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`

const Shortcut = styled.kbd`
  padding: 2px 4px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--foreground-muted);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 9px;
`

const TabsBar = styled.div`
  display: flex;
  height: 37px;
  flex: none;
  align-items: stretch;
  gap: 2px;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
`

const QueryTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  min-width: 132px;
  max-width: 210px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 11px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: var(--surface);
  }
`

const QueryTabItem = styled.div`
  display: inline-flex;
  align-items: stretch;
`

const TabLabel = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CloseTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  border: 0;
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: inherit;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

const AddTabButton = styled.button`
  display: inline-flex;
  width: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;

  &:hover {
    color: var(--foreground);
  }
`

const EditorToolbar = styled.div`
  display: flex;
  height: 34px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 10px;
`

const EditorPane = styled.section`
  display: flex;
  min-height: 220px;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
`

const EditorAndResults = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
`

const Status = styled.div`
  display: flex;
  height: 24px;
  flex: none;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border-top: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 10px;
`

const StatusDot = styled(Circle)<{ $connected: boolean }>`
  fill: ${({ $connected }) => ($connected ? 'var(--success)' : 'var(--foreground-subtle)')};
  color: ${({ $connected }) => ($connected ? 'var(--success)' : 'var(--foreground-subtle)')};
`

const EmptyEditor = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: var(--foreground-muted);
  font-size: 12px;
`

export function Workspace() {
  const platform = useWindowStore((state) => state.platform)
  const connections = useWorkspaceStore((state) => state.connections)
  const tablesByConnection = useWorkspaceStore((state) => state.tablesByConnection)
  const columnsByConnection = useWorkspaceStore((state) => state.columnsByConnection)
  const tabs = useWorkspaceStore((state) => state.tabs)
  const activeTabId = useWorkspaceStore((state) => state.activeTabId)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  const activeConnection = connections.find((connection) => connection.id === activeTab.connectionId) ?? null
  const tables = activeConnection ? (tablesByConnection[activeConnection.id] ?? []) : []
  const schema = activeConnection ? (columnsByConnection[activeConnection.id] ?? {}) : {}
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isOpening, setIsOpening] = useState(false)

  const setSchema = useWorkspaceStore((state) => state.setSchema)
  const addConnection = useWorkspaceStore((state) => state.addConnection)
  const removeConnection = useWorkspaceStore((state) => state.removeConnection)
  const addQueryTab = useWorkspaceStore((state) => state.addQueryTab)
  const activateTab = useWorkspaceStore((state) => state.activateTab)
  const closeTab = useWorkspaceStore((state) => state.closeTab)
  const setQueryText = useWorkspaceStore((state) => state.setQueryText)
  const setTabConnection = useWorkspaceStore((state) => state.setTabConnection)
  const setTabExecuting = useWorkspaceStore((state) => state.setTabExecuting)
  const setTabResult = useWorkspaceStore((state) => state.setTabResult)
  const setTabError = useWorkspaceStore((state) => state.setTabError)

  const openDatabase = async (mode: 'open' | 'create') => {
    setIsOpening(true)
    setConnectionError(null)
    try {
      // O renderer nunca recebe caminhos escolhidos por texto: a seleção acontece em um diálogo nativo.
      const connection = mode === 'open' ? await conveyor.database.openSQLite() : await conveyor.database.createSQLite()
      if (!connection) return

      const schema = await conveyor.database.schema(connection.id)
      addConnection(connection)
      setSchema(connection.id, schema)
    } catch (error) {
      setConnectionError(errorMessage(error))
    } finally {
      setIsOpening(false)
    }
  }

  const closeDatabase = async (connection: DatabaseConnection) => {
    try {
      await conveyor.database.close(connection.id)
      removeConnection(connection.id)
    } catch (error) {
      setConnectionError(errorMessage(error))
    }
  }

  const refreshTables = async () => {
    if (!activeConnection) return
    try {
      setSchema(activeConnection.id, await conveyor.database.schema(activeConnection.id))
    } catch (error) {
      setConnectionError(errorMessage(error))
    }
  }

  const openTable = async (table: DatabaseTable) => {
    if (!activeConnection) return
    try {
      const escapedName = table.name.replaceAll('"', '""')
      addQueryTab({
        connectionId: activeConnection.id,
        sql: `SELECT *\nFROM "${escapedName}"\nLIMIT 100;`,
      })
    } catch (error) {
      setConnectionError(errorMessage(error))
    }
  }

  const runQuery = async () => {
    if (!activeConnection || !activeTab.sql.trim() || activeTab.isExecuting) return
    setTabExecuting(activeTab.id, true)
    try {
      const result = await conveyor.database.execute({ connectionId: activeConnection.id, sql: activeTab.sql })
      setTabResult(activeTab.id, result)
    } catch (error) {
      setTabError(activeTab.id, errorMessage(error))
    }
  }

  return (
    <Layout>
      <DatabaseSidebar
        connections={connections}
        activeConnectionId={activeConnection?.id ?? null}
        tables={tables}
        error={connectionError}
        isBusy={isOpening}
        onOpenSQLite={() => void openDatabase('open')}
        onCreateSQLite={() => void openDatabase('create')}
        onSelectConnection={(connection) => setTabConnection(activeTab.id, connection.id)}
        onCloseConnection={(connectionId) => {
          const connection = connections.find((item) => item.id === connectionId)
          if (connection) void closeDatabase(connection)
        }}
        onOpenTable={(table) => void openTable(table)}
        onRefreshTables={() => void refreshTables()}
      />

      <Main>
        <Toolbar>
          <Location>
            <span>SQL</span>
            <span>/</span>
            <LocationName>{activeConnection?.name ?? 'Nenhum banco conectado'}</LocationName>
          </Location>
          <ToolbarActions>
            <ConnectionSelect
              aria-label="Banco desta consulta"
              value={activeTab.connectionId ?? ''}
              onChange={(event) => setTabConnection(activeTab.id, event.target.value || null)}
            >
              <option value="">Selecione um banco</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {connection.name}
                </option>
              ))}
            </ConnectionSelect>
            <RunButton
              type="button"
              onClick={() => void runQuery()}
              disabled={!activeConnection || !activeTab.sql.trim() || activeTab.isExecuting}
              title={`Executar consulta (${platform === 'darwin' ? 'Cmd' : 'Ctrl'} + Enter)`}
            >
              {activeTab.isExecuting ? <Square size={13} /> : <Play size={13} fill="currentColor" />}
              {activeTab.isExecuting ? 'Executando' : 'Executar'}
              <Shortcut>{platform === 'darwin' ? '⌘↵' : 'Ctrl ↵'}</Shortcut>
            </RunButton>
          </ToolbarActions>
        </Toolbar>

        <TabsBar role="tablist" aria-label="Consultas abertas">
          {tabs.map((tab) => (
            <QueryTabItem key={tab.id}>
              <QueryTabButton
                type="button"
                role="tab"
                aria-selected={tab.id === activeTabId}
                $active={tab.id === activeTabId}
                onClick={() => activateTab(tab.id)}
              >
                <Square size={12} />
                <TabLabel>{tab.title}</TabLabel>
              </QueryTabButton>
              <CloseTabButton
                type="button"
                $active={tab.id === activeTabId}
                aria-label={`Fechar ${tab.title}`}
                title={`Fechar ${tab.title}`}
                onClick={() => closeTab(tab.id)}
              >
                <X size={12} />
              </CloseTabButton>
            </QueryTabItem>
          ))}
          <AddTabButton type="button" title="Nova consulta" aria-label="Nova consulta" onClick={() => addQueryTab()}>
            <Plus size={15} />
          </AddTabButton>
        </TabsBar>

        <EditorAndResults>
          <EditorPane>
            <EditorToolbar>
              <span>SQLITE · SQL</span>
              <span>{activeTab.sql.split('\n').length} linhas</span>
            </EditorToolbar>
            {activeTab ? (
              <SqlEditor
                tab={activeTab}
                schema={schema}
                onChange={(sqlText) => setQueryText(activeTab.id, sqlText)}
                onRun={() => void runQuery()}
              />
            ) : (
              <EmptyEditor>Nenhuma consulta aberta.</EmptyEditor>
            )}
          </EditorPane>
          <QueryResults tab={activeTab} />
        </EditorAndResults>

        <Status>
          <StatusDot size={7} $connected={Boolean(activeConnection)} />
          {activeConnection ? `Conectado a ${activeConnection.name}` : 'Desconectado'}
          <span>·</span>
          {activeConnection ? activeConnection.path : 'Abra ou crie um banco SQLite local'}
        </Status>
      </Main>
    </Layout>
  )
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}
