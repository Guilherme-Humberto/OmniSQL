import { useMemo } from 'react'
import { Bookmark, ChevronRight, Database, History, Plus, Search, X } from 'lucide-react'
import type { ConnectionDraft, ConnectionProfile } from '@/conveyor/connection-contracts'
import { DatabaseDriver } from '@/app/constants/app-constants'
import { formatRelativeTime } from '../../url-parser'
import { ConnectionCardItem } from '../connection-card-item'
import {
  SidebarContainer,
  SidebarHeader,
  SidebarBrand,
  BrandTitle,
  QuickConnectButton,
  OutlineButton,
  SearchWrapper,
  SearchInput,
  SmallButton,
  ScrollList,
  Section,
  SectionHeader,
  SectionBadge,
  ClearButton,
  EmptyMessage,
} from './styles'

interface ConnectionSidebarProps {
  profiles: ConnectionProfile[]
  selectedId?: string
  search: string
  openConnectionsCount: number
  onSearchChange: (query: string) => void
  onNewConnection: () => void
  onSelectProfile: (profile: ConnectionProfile) => void
  onConnectProfile: (draft: ConnectionDraft) => void
  onDeleteProfile: (id: string) => void
  onClearRecents: () => void
  onGoToWorkspace: () => void
}

export function ConnectionSidebar({
  profiles,
  selectedId,
  search,
  openConnectionsCount,
  onSearchChange,
  onNewConnection,
  onSelectProfile,
  onConnectProfile,
  onDeleteProfile,
  onClearRecents,
  onGoToWorkspace,
}: ConnectionSidebarProps) {
  const savedProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (!p.saved) return false
      const query = search.toLowerCase()
      return (
        p.name.toLowerCase().includes(query) ||
        p.config.driver.toLowerCase().includes(query) ||
        (p.config.driver === DatabaseDriver.SQLite ? p.config.path.toLowerCase().includes(query) : p.config.host.toLowerCase().includes(query))
      )
    })
  }, [profiles, search])

  const recentProfiles = useMemo(() => {
    return profiles
      .filter((p) => p.lastUsedAt !== null)
      .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))
      .filter((p) => {
        const query = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(query) ||
          p.config.driver.toLowerCase().includes(query) ||
          (p.config.driver === DatabaseDriver.SQLite ? p.config.path.toLowerCase().includes(query) : p.config.host.toLowerCase().includes(query))
        )
      })
  }, [profiles, search])

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarBrand>
          <BrandTitle>
            <Database size={16} color="var(--brand)" />
            <span>Conexões</span>
          </BrandTitle>
          {openConnectionsCount > 0 && (
            <OutlineButton onClick={onGoToWorkspace} title="Ir para o Workspace">
              <ChevronRight size={13} />
              <span>Workspace</span>
            </OutlineButton>
          )}
        </SidebarBrand>

        <QuickConnectButton type="button" onClick={onNewConnection}>
          <Plus size={15} strokeWidth={2.5} />
          <span>Nova Conexão</span>
        </QuickConnectButton>

        <SearchWrapper>
          <Search size={13} />
          <SearchInput
            placeholder="Buscar conexões salvas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <SmallButton onClick={() => onSearchChange('')}>
              <X size={12} />
            </SmallButton>
          )}
        </SearchWrapper>
      </SidebarHeader>

      <ScrollList>
        {/* Saved Connections */}
        <Section>
          <SectionHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bookmark size={11} />
              <span>Conexões Salvas</span>
            </div>
            <SectionBadge>{savedProfiles.length}</SectionBadge>
          </SectionHeader>

          {savedProfiles.map((p) => {
            const isSelected = selectedId === p.id
            const subtitle =
              p.config.driver === DatabaseDriver.SQLite
                ? p.config.path.split('/').pop() || 'sqlite'
                : `${p.config.host}:${p.config.port}${p.config.database ? `/${p.config.database}` : ''}`

            return (
              <ConnectionCardItem
                key={p.id}
                profile={p}
                isSelected={isSelected}
                subtitle={subtitle}
                onSelect={() => onSelectProfile(p)}
                onDoubleClick={() => onConnectProfile({ ...p, password: '', savePassword: p.hasPassword })}
                onDelete={() => onDeleteProfile(p.id)}
              />
            )
          })}

          {savedProfiles.length === 0 && (
            <EmptyMessage>{search ? 'Nenhuma conexão encontrada' : 'Nenhuma conexão salva ainda'}</EmptyMessage>
          )}
        </Section>

        {/* Recent Connections */}
        <Section>
          <SectionHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={11} />
              <span>Recentes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SectionBadge>{recentProfiles.length}</SectionBadge>
              {recentProfiles.length > 0 && (
                <ClearButton type="button" onClick={onClearRecents}>
                  Limpar
                </ClearButton>
              )}
            </div>
          </SectionHeader>

          {recentProfiles.map((p) => {
            const isSelected = selectedId === p.id
            const relativeTime = formatRelativeTime(p.lastUsedAt)

            return (
              <ConnectionCardItem
                key={`recent-${p.id}`}
                profile={p}
                isSelected={isSelected}
                subtitle={relativeTime}
                onSelect={() => onSelectProfile(p)}
                onDoubleClick={() => onConnectProfile({ ...p, password: '', savePassword: p.hasPassword })}
              />
            )
          })}

          {recentProfiles.length === 0 && <EmptyMessage>Nenhuma conexão recente</EmptyMessage>}
        </Section>
      </ScrollList>
    </SidebarContainer>
  )
}

