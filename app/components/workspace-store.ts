import { create } from 'zustand'
import type {
  DatabaseConnection,
  DatabaseQueryResult,
  DatabaseSchema,
  DatabaseTable,
} from '@/conveyor/database-contracts'
import { AppView, QueryExecutionEngine } from '@/app/constants/app-constants'

const initialQuery = `-- Abra ou crie um banco SQLite para começar.
SELECT name, type
FROM sqlite_master
WHERE type IN ('table', 'view')
ORDER BY name;`

export interface QueryTab {
  id: string
  title: string
  sql: string
  connectionId: string | null
  engine?: QueryExecutionEngine
  result: DatabaseQueryResult | null
  error: string | null
  isExecuting: boolean
}

export type WorkspaceView = AppView | 'connections' | 'workspace'

interface WorkspaceState {
  currentView: WorkspaceView
  connections: DatabaseConnection[]
  tablesByConnection: Record<string, DatabaseTable[]>
  columnsByConnection: Record<string, Record<string, string[]>>
  tabs: QueryTab[]
  activeTabId: string
  nextTabNumber: number
  setCurrentView: (view: WorkspaceView) => void
  addConnection: (connection: DatabaseConnection) => void
  removeConnection: (connectionId: string) => void
  setTables: (connectionId: string, tables: DatabaseTable[]) => void
  setSchema: (connectionId: string, schema: DatabaseSchema) => void
  addQueryTab: (options?: { sql?: string; connectionId?: string | null; engine?: QueryExecutionEngine }) => string
  activateTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  setQueryText: (tabId: string, sql: string) => void
  setTabConnection: (tabId: string, connectionId: string | null) => void
  setTabEngine: (tabId: string, engine: QueryExecutionEngine) => void
  setTabExecuting: (tabId: string, isExecuting: boolean) => void
  setTabResult: (tabId: string, result: DatabaseQueryResult) => void
  setTabError: (tabId: string, error: string) => void
}

const firstTabId = crypto.randomUUID()

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentView: 'connections',
  connections: [],
  tablesByConnection: {},
  columnsByConnection: {},
  tabs: [
    {
      id: firstTabId,
      title: 'Consulta 1',
      sql: initialQuery,
      connectionId: null,
      result: null,
      error: null,
      isExecuting: false,
    },
  ],
  activeTabId: firstTabId,
  nextTabNumber: 2,
  setCurrentView: (currentView) => set({ currentView }),
  addConnection: (connection) => {
    set((state) => ({
      currentView: 'workspace',
      connections: state.connections.some((item) => item.id === connection.id)
        ? state.connections
        : [...state.connections, connection],
      tablesByConnection: {
        ...state.tablesByConnection,
        [connection.id]: state.tablesByConnection[connection.id] ?? [],
      },
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId ? { ...tab, connectionId: connection.id, result: null, error: null } : tab
      ),
    }))
  },
  removeConnection: (connectionId) => {
    set((state) => {
      const tablesByConnection = { ...state.tablesByConnection }
      const columnsByConnection = { ...state.columnsByConnection }
      delete tablesByConnection[connectionId]
      delete columnsByConnection[connectionId]
      return {
        connections: state.connections.filter((connection) => connection.id !== connectionId),
        tablesByConnection,
        columnsByConnection,
        tabs: state.tabs.map((tab) =>
          tab.connectionId === connectionId ? { ...tab, connectionId: null, result: null } : tab
        ),
      }
    })
  },
  setTables: (connectionId, tables) =>
    set((state) => ({ tablesByConnection: { ...state.tablesByConnection, [connectionId]: tables } })),
  setSchema: (connectionId, schema) =>
    set((state) => ({
      tablesByConnection: { ...state.tablesByConnection, [connectionId]: schema.tables },
      columnsByConnection: {
        ...state.columnsByConnection,
        [connectionId]: schema.columnsByTable,
      },
    })),
  addQueryTab: (options) => {
    const tabId = crypto.randomUUID()
    const state = get()
    const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId)
    const nextTab: QueryTab = {
      id: tabId,
      title: options?.engine === QueryExecutionEngine.CrossDatabase
        ? `Cross-DB ${state.nextTabNumber}`
        : `Consulta ${state.nextTabNumber}`,
      sql: options?.sql ?? '',
      connectionId: options?.connectionId ?? activeTab?.connectionId ?? null,
      engine: options?.engine ?? QueryExecutionEngine.Direct,
      result: null,
      error: null,
      isExecuting: false,
    }
    set((current) => ({
      tabs: [...current.tabs, nextTab],
      activeTabId: tabId,
      nextTabNumber: current.nextTabNumber + 1,
    }))
    return tabId
  },
  activateTab: (tabId) => set({ activeTabId: tabId }),
  closeTab: (tabId) => {
    const state = get()
    if (state.tabs.length === 1) {
      set((current) => ({
        tabs: current.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, sql: '', result: null, error: null, isExecuting: false } : tab
        ),
      }))
      return
    }
    const remainingTabs = state.tabs.filter((tab) => tab.id !== tabId)
    set({
      tabs: remainingTabs,
      activeTabId: state.activeTabId === tabId ? remainingTabs[remainingTabs.length - 1].id : state.activeTabId,
    })
  },
  setQueryText: (tabId, sql) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, sql, result: null, error: null } : tab)),
    })),
  setTabConnection: (tabId, connectionId) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, connectionId, result: null, error: null } : tab)),
    })),
  setTabEngine: (tabId, engine) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, engine, result: null, error: null } : tab)),
    })),
  setTabExecuting: (tabId, isExecuting) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, isExecuting, error: null } : tab)),
    })),
  setTabResult: (tabId, result) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, result, error: null, isExecuting: false } : tab)),
    })),
  setTabError: (tabId, error) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, error, isExecuting: false } : tab)),
    })),
}))
