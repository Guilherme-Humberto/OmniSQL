import { useState } from 'react'
import { conveyor } from '@/conveyor/client'
import type { ConnectionDraft, ConnectionDriver, ConnectionProfile, TestResult } from '@/conveyor/connection-contracts'
import { DEFAULT_DRAFT } from './constants'
import { useWorkspaceStore } from '@/app/components/workspace-store'
import {
  DatabaseDriver,
  DEFAULT_DATABASE_PORTS,
  DEFAULT_DATABASE_USERS,
  DEFAULT_DATABASES,
} from '@/app/constants/app-constants'

/**
 * Hook customizado responsável pelo estado e ações do formulário de conexões.
 * Centraliza validações, testes, salvamento e conexão (Clean Architecture / Single Responsibility).
 */
export function useConnectionForm() {
  const setCurrentView = useWorkspaceStore((state) => state.setCurrentView)
  const addConnection = useWorkspaceStore((state) => state.addConnection)
  const setSchema = useWorkspaceStore((state) => state.setSchema)

  // Lista de perfis do Conveyor IPC
  const { data: profiles = [], refetch: refetchProfiles } = conveyor.connections.list.useQuery()

  const [draft, setDraft] = useState<ConnectionDraft>(DEFAULT_DRAFT)
  const [search, setSearch] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Iniciar nova conexão em branco
  const resetToNew = () => {
    setDraft(DEFAULT_DRAFT)
    setTestResult(null)
    setActionError(null)
  }

  // Carregar perfil existente para edição
  const selectProfile = (profile: ConnectionProfile) => {
    setDraft({
      id: profile.id,
      name: profile.name,
      color: profile.color,
      config: { ...profile.config },
      password: '',
      savePassword: profile.hasPassword,
    })
    setTestResult(null)
    setActionError(null)
  }

  // Alternar motor de banco
  const changeDriver = (driver: ConnectionDriver) => {
    setActionError(null)
    setTestResult(null)
    if (driver === DatabaseDriver.SQLite) {
      setDraft((prev) => ({
        ...prev,
        config: {
          driver: DatabaseDriver.SQLite,
          path: prev.config.driver === DatabaseDriver.SQLite ? prev.config.path : '',
        },
      }))
    } else {
      const defaultPort = driver === DatabaseDriver.PostgreSQL ? DEFAULT_DATABASE_PORTS[DatabaseDriver.PostgreSQL] : DEFAULT_DATABASE_PORTS[DatabaseDriver.MySQL]
      const defaultUser = driver === DatabaseDriver.PostgreSQL ? DEFAULT_DATABASE_USERS[DatabaseDriver.PostgreSQL] : DEFAULT_DATABASE_USERS[DatabaseDriver.MySQL]
      const defaultDb = driver === DatabaseDriver.PostgreSQL ? DEFAULT_DATABASES[DatabaseDriver.PostgreSQL] : DEFAULT_DATABASES[DatabaseDriver.MySQL]
      setDraft((prev) => ({
        ...prev,
        config: {
          driver,
          host: prev.config.driver !== DatabaseDriver.SQLite ? prev.config.host || 'localhost' : 'localhost',
          port: defaultPort,
          user: prev.config.driver !== DatabaseDriver.SQLite ? prev.config.user || defaultUser : defaultUser,
          database: prev.config.driver !== DatabaseDriver.SQLite ? prev.config.database : defaultDb,
          ssl: false,
        },
      }))
    }
  }

  // Seletor nativo de arquivos SQLite
  const pickSQLiteFile = async () => {
    try {
      const file = await conveyor.connections.pickSQLiteFile()
      if (file) {
        setDraft((prev) => ({
          ...prev,
          name: prev.name === 'Nova Conexão' ? file.name : prev.name,
          config: { driver: 'sqlite', path: file.path },
        }))
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao selecionar arquivo')
    }
  }

  const createSQLiteFile = async () => {
    try {
      const file = await conveyor.connections.createSQLiteFile()
      if (file) {
        setDraft((prev) => ({
          ...prev,
          name: prev.name === 'Nova Conexão' ? file.name : prev.name,
          config: { driver: 'sqlite', path: file.path },
        }))
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao criar arquivo')
    }
  }

  // Salvar perfil de conexão
  const saveProfile = async () => {
    try {
      setActionError(null)
      const saved = await conveyor.connections.saveProfile(draft)
      setDraft((prev) => ({ ...prev, id: saved.id }))
      await refetchProfiles()
      setTestResult({
        ok: true,
        message: 'Perfil de conexão salvo com sucesso!',
        durationMs: 0,
      })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
    }
  }

  // Testar conexão
  const testConnection = async () => {
    setIsTesting(true)
    setActionError(null)
    setTestResult(null)
    try {
      const res = await conveyor.connections.test(draft)
      setTestResult(res)
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Erro no teste de conexão.',
        durationMs: 0,
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Conectar ao banco
  const connect = async (targetDraft = draft) => {
    setIsConnecting(true)
    setActionError(null)
    try {
      const result = await conveyor.connections.connect(targetDraft)
      addConnection(result.connection)
      const schema = await conveyor.database.schema(result.connection.id)
      setSchema(result.connection.id, schema)
      await refetchProfiles()
      setCurrentView('workspace')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao conectar ao banco.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Deletar perfil
  const deleteProfile = async (id: string) => {
    try {
      await conveyor.connections.deleteProfile({ id })
      if (draft.id === id) resetToNew()
      await refetchProfiles()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao excluir perfil.')
    }
  }

  // Limpar histórico recente
  const clearRecents = async () => {
    try {
      await conveyor.connections.clearRecents()
      await refetchProfiles()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao limpar recentes.')
    }
  }

  // Aplicar importação de URL
  const applyImportedUrl = (patch: Partial<ConnectionDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...patch,
      config: {
        ...prev.config,
        ...(patch.config as any),
      },
    }))
  }

  return {
    draft,
    setDraft,
    search,
    setSearch,
    profiles,
    isTesting,
    isConnecting,
    testResult,
    actionError,
    isImportModalOpen,
    setIsImportModalOpen,
    resetToNew,
    selectProfile,
    changeDriver,
    pickSQLiteFile,
    createSQLiteFile,
    saveProfile,
    testConnection,
    connect,
    deleteProfile,
    clearRecents,
    applyImportedUrl,
    setCurrentView,
  }
}
