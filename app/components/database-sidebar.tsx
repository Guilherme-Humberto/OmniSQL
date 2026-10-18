import { useMemo, useState } from 'react'
import { Database, FolderOpen, Plus, RefreshCw, Search, Table2, X } from 'lucide-react'
import styled from 'styled-components'
import type { DatabaseConnection, DatabaseTable } from '@/conveyor/database-contracts'

const Sidebar = styled.aside`
  display: flex;
  width: 248px;
  min-width: 210px;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--border);
  background: var(--sidebar);
`

const SidebarHeader = styled.div`
  display: flex;
  height: 48px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid var(--border);
`

const WorkspaceName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 650;
`

const LocalBadge = styled.span`
  padding: 2px 5px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--foreground-muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.3px;
`

const IconButton = styled.button`
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.5;
  }
`

const ScrollContent = styled.div`
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 14px 8px;
`

const Section = styled.section`
  & + & {
    margin-top: 22px;
  }
`

const SectionHeader = styled.div`
  display: flex;
  min-height: 28px;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  color: var(--foreground-muted);
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
`

const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
`

const ConnectionList = styled.div`
  display: grid;
  gap: 2px;
  margin-top: 4px;
`

const ConnectionRow = styled.div<{ $active: boolean }>`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--accent)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

const ConnectionSelect = styled.button`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
`

const ConnectionText = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const EmptyConnections = styled.div`
  padding: 10px 8px 12px;
  color: var(--foreground-muted);
  font-size: 11px;
  line-height: 1.6;
`

const EmptyActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 9px;
`

const TextButton = styled.button`
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

const SearchBox = styled.label`
  display: flex;
  height: 28px;
  align-items: center;
  gap: 7px;
  margin: 4px 4px 5px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--foreground-muted);
`

const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
  font: inherit;
  font-size: 11px;

  &::placeholder {
    color: var(--foreground-subtle);
  }
`

const TableList = styled.div`
  display: grid;
  gap: 1px;
`

const TableButton = styled.button`
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 6px 9px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  font: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

const TableName = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ErrorMessage = styled.div`
  margin: 8px 8px 0;
  padding: 8px;
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  border-radius: 4px;
  color: var(--danger);
  font-size: 11px;
  overflow-wrap: anywhere;
`

const SidebarFooter = styled.footer`
  padding: 9px 14px;
  border-top: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 10px;
`

interface DatabaseSidebarProps {
  connections: DatabaseConnection[]
  activeConnectionId: string | null
  tables: DatabaseTable[]
  error: string | null
  isBusy: boolean
  onOpenSQLite: () => void
  onCreateSQLite: () => void
  onSelectConnection: (connection: DatabaseConnection) => void
  onCloseConnection: (connectionId: string) => void
  onOpenTable: (table: DatabaseTable) => void
  onRefreshTables: () => void
}

export function DatabaseSidebar({
  connections,
  activeConnectionId,
  tables,
  error,
  isBusy,
  onOpenSQLite,
  onCreateSQLite,
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
          <IconButton type="button" title="Abrir banco SQLite" aria-label="Abrir banco SQLite" onClick={onOpenSQLite}>
            <FolderOpen size={14} />
          </IconButton>
          <IconButton type="button" title="Criar banco SQLite" aria-label="Criar banco SQLite" onClick={onCreateSQLite}>
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
                title="Abrir banco SQLite"
                aria-label="Abrir banco SQLite"
                onClick={onOpenSQLite}
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
                    {table.kind === 'view' && <LocalBadge>VIEW</LocalBadge>}
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
