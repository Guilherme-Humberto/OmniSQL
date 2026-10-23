import { useMemo, useState } from 'react'
import { Database, FolderOpen, Plus, RefreshCw, Search, Table2, X } from 'lucide-react'
import type { DatabaseConnection, DatabaseTable } from '@/conveyor/database-contracts'
import { DatabaseEntityKind } from '@/app/constants/app-constants'
import {
  Sidebar,
  SidebarHeader,
  WorkspaceName,
  LocalBadge,
  IconButton,
  ScrollContent,
  Section,
  SectionHeader,
  SectionActions,
  ConnectionList,
  ConnectionRow,
  ConnectionSelect,
  ConnectionText,
  EmptyConnections,
  EmptyActions,
  TextButton,
  SearchBox,
  SearchInput,
  TableList,
  TableButton,
  TableName,
  ErrorMessage,
  SidebarFooter,
} from './styles'

interface DatabaseSidebarProps {
  connections: DatabaseConnection[]
  activeConnectionId: string | null
  tables: DatabaseTable[]
  error: string | null
  isBusy: boolean
  onOpenSQLite: () => void
  onCreateSQLite: () => void
  onOpenConnectionManager?: () => void
  onSelectConnection: (connection: DatabaseConnection) => void
  onCloseConnection: (connectionId: string) => void
  onOpenTable: (table: DatabaseTable) => void
  onRefreshTables: () => void
}

/**
 * Barra lateral do workspace contendo conexões ativas e explorador de tabelas/views.
 */
export function DatabaseSidebar({
  connections,
  activeConnectionId,
  tables,
  error,
  isBusy,
  onOpenSQLite,
  onCreateSQLite,
  onOpenConnectionManager,
  onSelectConnection,
  onCloseConnection,
  onOpenTable,
  onRefreshTables,
}: DatabaseSidebarProps) {
  const [filter, setFilter] = useState('')
  const filteredTables = useMemo(
    () => tables.filter((table) => table.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())),
    [filter, tables]
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <WorkspaceName>
          <Database size={15} />
          Workspace
          <LocalBadge>LOCAL</LocalBadge>
        </WorkspaceName>
        <SectionActions>
          <IconButton
            type="button"
            title="Gerenciador de Conexões"
            aria-label="Gerenciador de Conexões"
            onClick={onOpenConnectionManager}
          >
            <Plus size={15} />
          </IconButton>
        </SectionActions>
      </SidebarHeader>

      <ScrollContent>
        <Section>
          <SectionHeader>
            Conexões
            <SectionActions>
              <IconButton
                type="button"
                title="Nova Conexão"
                aria-label="Nova Conexão"
                onClick={onOpenConnectionManager}
                disabled={isBusy}
              >
                <Plus size={14} />
              </IconButton>
            </SectionActions>
          </SectionHeader>
          {connections.length ? (
            <ConnectionList>
              {connections.map((connection) => (
                <ConnectionRow key={connection.id} $active={connection.id === activeConnectionId}>
                  <ConnectionSelect
                    type="button"
                    onClick={() => onSelectConnection(connection)}
                    title={connection.path}
                  >
                    <Database size={14} />
                    <ConnectionText>{connection.name}</ConnectionText>
                  </ConnectionSelect>
                  <IconButton
                    type="button"
                    title={`Fechar ${connection.name}`}
                    aria-label={`Fechar ${connection.name}`}
                    onClick={() => onCloseConnection(connection.id)}
                  >
                    <X size={13} />
                  </IconButton>
                </ConnectionRow>
              ))}
            </ConnectionList>
          ) : (
            <EmptyConnections>
              Nenhum banco aberto.
              <EmptyActions>
                <TextButton type="button" onClick={onOpenConnectionManager}>
                  <Plus size={13} /> Conectar
                </TextButton>
                <TextButton type="button" onClick={onOpenSQLite} disabled={isBusy}>
                  <FolderOpen size={13} /> Abrir
                </TextButton>
                <TextButton type="button" onClick={onCreateSQLite} disabled={isBusy}>
                  <Plus size={13} /> Criar
                </TextButton>
              </EmptyActions>
            </EmptyConnections>
          )}
        </Section>

        <Section>
          <SectionHeader>
            Tabelas e views
            <SectionActions>
              <IconButton
                type="button"
                title="Atualizar tabelas"
                aria-label="Atualizar tabelas"
                onClick={onRefreshTables}
                disabled={!activeConnectionId || isBusy}
              >
                <RefreshCw size={13} />
              </IconButton>
            </SectionActions>
          </SectionHeader>
          {activeConnectionId ? (
            <>
              <SearchBox>
                <Search size={13} />
                <SearchInput
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Filtrar objetos"
                  aria-label="Filtrar tabelas e views"
                />
              </SearchBox>
              <TableList>
                {filteredTables.map((table) => (
                  <TableButton key={`${table.kind}:${table.name}`} type="button" onClick={() => onOpenTable(table)}>
                    <Table2 size={13} />
                    <TableName>{table.name}</TableName>
                    {table.kind === DatabaseEntityKind.View && <LocalBadge>VIEW</LocalBadge>}
                  </TableButton>
                ))}
                {!filteredTables.length && <EmptyConnections>Nenhuma tabela encontrada.</EmptyConnections>}
              </TableList>
            </>
          ) : (
            <EmptyConnections>Abra um arquivo SQLite para explorar os objetos.</EmptyConnections>
          )}
        </Section>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      </ScrollContent>

      <SidebarFooter>SQLite · arquivos locais</SidebarFooter>
    </Sidebar>
  )
}
