import { useMemo, useState } from 'react'
import { BookOpen, Code2, Database, Play, Plus, Sparkles, Square, X } from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import type { DatabaseConnection, DatabaseTable } from '@/conveyor/database-contracts'
import { QueryExecutionEngine, SQLiteFileMode } from '../../constants/app-constants'
import { useWindowStore } from '../../shell/window-store'
import { DatabaseSidebar } from '../database-sidebar'
import { QueryResults } from '../query-results'
import { SqlEditor } from '../sql-editor'
import { CodeGeneratorModal } from '../code-generator-modal'
import { AiTriggerButton } from '../../features/ai-assistant/components/ai-trigger-button'
import { AiModal } from '../../features/ai-assistant/components/ai-modal'
import { DocumentationModal } from '../../features/documentation/components/documentation-modal'
import { CrossDbSourcesDrawer } from '../../features/cross-db/components/cross-db-sources-drawer'
import { useWorkspaceStore } from '../workspace-store'
import {
  Layout,
  Main,
  Toolbar,
  Location,
  LocationName,
  ToolbarActions,
  ConnectionSelect,
  RunButton,
  Shortcut,
  ToolbarButton,
  TabsBar,
  QueryTabItem,
  QueryTabButton,
  TabLabel,
  CloseTabButton,
  AddTabButton,
  EditorAndResults,
  EditorPane,
  EditorToolbar,
  EmptyEditor,
  Status,
  StatusDot,
} from './styles'

/**
 * Área de trabalho principal para edição e execução de consultas SQL.
 */
export function Workspace() {
  const platform = useWindowStore((state) => state.platform)
  const connections = useWorkspaceStore((state) => state.connections)
  const tablesByConnection = useWorkspaceStore((state) => state.tablesByConnection)
  const columnsByConnection = useWorkspaceStore((state) => state.columnsByConnection)
  const tabs = useWorkspaceStore((state) => state.tabs)
  const activeTabId = useWorkspaceStore((state) => state.activeTabId)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  const activeConnection = connections.find((connection) => connection.id === activeTab.connectionId) ?? null
  const tables = useMemo(
    () => (activeConnection ? (tablesByConnection[activeConnection.id] ?? []) : []),
    [activeConnection, tablesByConnection]
  )
  const schema = useMemo(
    () => (activeConnection ? (columnsByConnection[activeConnection.id] ?? {}) : {}),
    [activeConnection, columnsByConnection]
  )
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [isCodeGenOpen, setIsCodeGenOpen] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)

  const schemaTablesSummary = useMemo(() => {
    if (!activeConnection) return []
    return tables.map((t) => ({
      name: t.name,
      columns: (columnsByConnection[activeConnection.id]?.[t.name] ?? []).map((colName) => ({
        name: colName,
        type: 'TEXT',
      })),
    }))
  }, [activeConnection, tables, columnsByConnection])

  const setSchema = useWorkspaceStore((state) => state.setSchema)
  const addConnection = useWorkspaceStore((state) => state.addConnection)
  const removeConnection = useWorkspaceStore((state) => state.removeConnection)
  const addQueryTab = useWorkspaceStore((state) => state.addQueryTab)
  const activateTab = useWorkspaceStore((state) => state.activateTab)
  const closeTab = useWorkspaceStore((state) => state.closeTab)
  const setQueryText = useWorkspaceStore((state) => state.setQueryText)
  const setTabConnection = useWorkspaceStore((state) => state.setTabConnection)
  const setTabEngine = useWorkspaceStore((state) => state.setTabEngine)
  const setTabExecuting = useWorkspaceStore((state) => state.setTabExecuting)
  const setTabResult = useWorkspaceStore((state) => state.setTabResult)
  const setTabError = useWorkspaceStore((state) => state.setTabError)
  const setCurrentView = useWorkspaceStore((state) => state.setCurrentView)

  const [isCrossDbDrawerOpen, setIsCrossDbDrawerOpen] = useState(false)

  // Identifica se a aba atual está no modo de consulta federada Cross-Database (DuckDB)
  const isCrossDb =
    activeTab.engine === QueryExecutionEngine.CrossDatabase ||
    /read_csv|read_parquet|read_json/i.test(activeTab.sql)

  const openDatabase = async (mode: SQLiteFileMode) => {
    setIsOpening(true)
    setConnectionError(null)
    try {
      const connection =
        mode === SQLiteFileMode.Open
          ? await conveyor.database.openSQLite()
          : await conveyor.database.createSQLite()
      if (!connection) return

      const schemaData = await conveyor.database.schema(connection.id)
      addConnection(connection)
      setSchema(connection.id, schemaData)
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
      const querySql = `SELECT *\nFROM "${escapedName}"\nLIMIT 100;`
      const newTabId = addQueryTab({
        connectionId: activeConnection.id,
        sql: querySql,
      })
      setTabExecuting(newTabId, true)
      try {
        const result = await conveyor.database.execute({ connectionId: activeConnection.id, sql: querySql })
        setTabResult(newTabId, result)
      } catch (err) {
        setTabError(newTabId, errorMessage(err))
      }
    } catch (error) {
      setConnectionError(errorMessage(error))
    }
  }

  const runQuery = async () => {
    if (!activeTab.sql.trim() || activeTab.isExecuting) return

    // Execução federada via DuckDB para consultas cross-database ou arquivos locais
    if (isCrossDb) {
      setTabExecuting(activeTab.id, true)
      try {
        const result = await conveyor.crossDb.execute({ sql: activeTab.sql })
        setTabResult(activeTab.id, result)
      } catch (error) {
        setTabError(activeTab.id, errorMessage(error))
      } finally {
        setTabExecuting(activeTab.id, false)
      }
      return
    }

    if (!activeConnection) return
    setTabExecuting(activeTab.id, true)
    try {
      const result = await conveyor.database.execute({ connectionId: activeConnection.id, sql: activeTab.sql })
      setTabResult(activeTab.id, result)
    } catch (error) {
      setTabError(activeTab.id, errorMessage(error))
    }
  }

  const handleInsertCrossDbSnippet = (snippet: string) => {
    setTabEngine(activeTab.id, QueryExecutionEngine.CrossDatabase)
    if (snippet.startsWith('SELECT') || snippet.startsWith('--')) {
      setQueryText(activeTab.id, snippet)
    } else {
      const newSql = activeTab.sql.trim()
        ? `${activeTab.sql} ${snippet}`
        : `SELECT *\nFROM ${snippet}\nLIMIT 50;`
      setQueryText(activeTab.id, newSql)
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
        onOpenSQLite={() => void openDatabase(SQLiteFileMode.Open)}
        onCreateSQLite={() => void openDatabase(SQLiteFileMode.Create)}
        onOpenConnectionManager={() => setCurrentView('connections')}
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
            <LocationName>
              {isCrossDb ? 'Cross-Database Engine (DuckDB)' : activeConnection?.name ?? 'Nenhum banco conectado'}
            </LocationName>
          </Location>
          <ToolbarActions>
            <ToolbarButton
              type="button"
              onClick={() => setCurrentView('connections')}
              title="Abrir Gerenciador de Conexões"
            >
              <Database size={13} />
              <span>Conexões</span>
            </ToolbarButton>
            {activeConnection && (
              <ToolbarButton
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                title="Dicionário de Dados Markdown, Diagrama ER Mermaid e Auto-Documentador IA"
              >
                <BookOpen size={13} />
                <span>Documentação</span>
              </ToolbarButton>
            )}
            <ToolbarButton
              type="button"
              onClick={() => setIsCrossDbDrawerOpen(true)}
              title="Consultas federadas Cross-Database via DuckDB (JOINs entre MySQL, Postgres e arquivos CSV/Parquet)"
              style={isCrossDb ? { borderColor: 'rgba(234, 179, 8, 0.4)', color: '#eab308' } : undefined}
            >
              <Sparkles size={13} color="#eab308" />
              <span>Cross-DB (DuckDB)</span>
            </ToolbarButton>
            <ConnectionSelect
              aria-label="Banco desta consulta"
              value={activeTab.connectionId ?? ''}
              onChange={(event) => setTabConnection(activeTab.id, event.target.value || null)}
            >
              <option value="">{isCrossDb ? 'DuckDB (Federado / In-Memory)' : 'Selecione um banco'}</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {connection.name}
                </option>
              ))}
            </ConnectionSelect>
            <RunButton
              type="button"
              onClick={() => void runQuery()}
              disabled={(!activeConnection && !isCrossDb) || !activeTab.sql.trim() || activeTab.isExecuting}
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
                {tab.engine === QueryExecutionEngine.CrossDatabase && (
                  <span style={{ fontSize: '9px', color: '#eab308', fontWeight: 700 }}>[DuckDB]</span>
                )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{isCrossDb ? 'DUCKDB · FEDERATED' : (activeConnection?.driver || 'sqlite').toUpperCase() + ' · SQL'}</span>
                <span>{activeTab.sql.split('\n').length} linhas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AiTriggerButton onClick={() => setIsAiOpen(true)} />
                <ToolbarButton
                  type="button"
                  onClick={() => setIsCodeGenOpen(true)}
                  title="Gerar código ORM e APIs (Prisma, TypeORM, SQLAlchemy, C#, Next.js)"
                >
                  <Code2 size={13} />
                  <span>Gerar Código</span>
                </ToolbarButton>
              </div>
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
          <QueryResults
            tab={activeTab}
            connectionId={activeConnection?.id}
            availableTables={tables.map((t) => t.name)}
            onGenerateCode={() => setIsCodeGenOpen(true)}
            onOpenInNewTab={(newSql) => {
              if (activeConnection) {
                addQueryTab({ connectionId: activeConnection.id, sql: newSql })
              }
            }}
          />
        </EditorAndResults>

        <Status>
          <StatusDot size={7} $connected={Boolean(activeConnection || isCrossDb)} />
          {isCrossDb
            ? 'Motor DuckDB ativo · Consultas federadas e arquivos locais'
            : activeConnection
              ? `Conectado a ${activeConnection.name}`
              : 'Desconectado'}
          <span>·</span>
          {isCrossDb
            ? 'Pronto para JOINs entre MySQL, PostgreSQL, SQLite e arquivos CSV/Parquet'
            : activeConnection
              ? activeConnection.path
              : 'Abra ou conecte-se a um banco de dados'}
        </Status>
      </Main>

      {isCodeGenOpen && (
        <CodeGeneratorModal sql={activeTab.sql} result={activeTab.result} onClose={() => setIsCodeGenOpen(false)} />
      )}

      {isAiOpen && (
        <AiModal
          isOpen={isAiOpen}
          driver={activeConnection?.driver || 'sqlite'}
          schemaTables={schemaTablesSummary}
          onClose={() => setIsAiOpen(false)}
          onInsertSql={(newSql) => setQueryText(activeTab.id, newSql)}
          onOpenInNewTab={(newSql) => {
            if (activeConnection) {
              addQueryTab({ connectionId: activeConnection.id, sql: newSql })
            }
          }}
        />
      )}

      {isDocModalOpen && activeConnection && (
        <DocumentationModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          connectionId={activeConnection.id}
          connectionName={activeConnection.name}
          driver={activeConnection.driver}
          tables={tables}
        />
      )}

      {isCrossDbDrawerOpen && (
        <CrossDbSourcesDrawer
          isOpen={isCrossDbDrawerOpen}
          onClose={() => setIsCrossDbDrawerOpen(false)}
          onInsertSnippet={handleInsertCrossDbSnippet}
        />
      )}
    </Layout>
  )
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}
