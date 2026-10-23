import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Link as LinkIcon,
  Play,
  Sparkles,
} from 'lucide-react'
import { useWorkspaceStore } from '../workspace-store'
import { useConnectionForm } from '../../features/connections/use-connection-form'
import { ConnectionSidebar } from '../../features/connections/components/connection-sidebar'
import { DriverSelector } from '../../features/connections/components/driver-selector'
import { ConnectionFields } from '../../features/connections/components/connection-fields'
import { ConnectionIdentity } from '../../features/connections/components/connection-identity'
import { UrlImportModal } from '../../features/connections/components/url-import-modal'
import {
  Container,
  MainContent,
  MainHeader,
  HeaderTitleGroup,
  HeaderTitle,
  DraftStatusBadge,
  HeaderActions,
  OutlineButton,
  FormScroll,
  FooterBar,
  FeedbackArea,
  FeedbackBadge,
  ActionButtons,
  PrimaryButton,
} from './styles'

/**
 * Hub principal de gerenciamento e início de conexões (estilo Beekeeper Studio).
 * Segue padrões Clean Architecture e SOLID (orquestrador desacoplado).
 */
export function ConnectionManager() {
  const openConnectionsCount = useWorkspaceStore((state) => state.connections.length)
  const form = useConnectionForm()

  return (
    <Container>
      {/* Barra lateral de conexões salvas e recentes */}
      <ConnectionSidebar
        profiles={form.profiles}
        selectedId={form.draft.id}
        search={form.search}
        openConnectionsCount={openConnectionsCount}
        onSearchChange={form.setSearch}
        onNewConnection={form.resetToNew}
        onSelectProfile={form.selectProfile}
        onConnectProfile={form.connect}
        onDeleteProfile={form.deleteProfile}
        onClearRecents={form.clearRecents}
        onGoToWorkspace={() => form.setCurrentView('workspace')}
      />

      {/* Painel principal de configuração de conexões */}
      <MainContent>
        <MainHeader>
          <HeaderTitleGroup>
            <HeaderTitle>{form.draft.name || 'Nova Conexão'}</HeaderTitle>
            <DraftStatusBadge>
              <Sparkles size={11} color="var(--brand)" />
              <span>{form.draft.id ? 'Perfil Salvo' : 'Rascunho'}</span>
            </DraftStatusBadge>
          </HeaderTitleGroup>

          <HeaderActions>
            <OutlineButton type="button" onClick={() => form.setIsImportModalOpen(true)}>
              <LinkIcon size={12} />
              <span>Importar de URL</span>
            </OutlineButton>

            {openConnectionsCount > 0 && (
              <OutlineButton type="button" onClick={() => form.setCurrentView('workspace')}>
                <Layers size={13} />
                <span>Voltar ao Workspace</span>
              </OutlineButton>
            )}
          </HeaderActions>
        </MainHeader>

        <FormScroll>
          {/* Seletor visual de motores de banco */}
          <DriverSelector
            selectedDriver={form.draft.config.driver}
            onSelect={form.changeDriver}
          />

          {/* Campos específicos do motor (SQLite ou Rede) */}
          <ConnectionFields
            draft={form.draft}
            onChangeDraft={form.setDraft}
            onPickSQLite={form.pickSQLiteFile}
            onCreateSQLite={form.createSQLiteFile}
          />

          {/* Nome, cor do perfil e opções de segurança */}
          <ConnectionIdentity
            draft={form.draft}
            onChangeDraft={form.setDraft}
          />
        </FormScroll>

        {/* Rodapé de ações (Testar, Salvar, Conectar) */}
        <FooterBar>
          <FeedbackArea>
            {form.isTesting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--foreground-muted)' }}>
                <Clock size={13} className="animate-spin" />
                <span>Testando conexão...</span>
              </div>
            )}

            {!form.isTesting && form.testResult && (
              <FeedbackBadge $ok={form.testResult.ok}>
                {form.testResult.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>
                  {form.testResult.message} {form.testResult.durationMs > 0 && `(${form.testResult.durationMs}ms)`}
                </span>
              </FeedbackBadge>
            )}

            {!form.isTesting && !form.testResult && form.actionError && (
              <FeedbackBadge $ok={false}>
                <AlertTriangle size={14} />
                <span>{form.actionError}</span>
              </FeedbackBadge>
            )}
          </FeedbackArea>

          <ActionButtons>
            <OutlineButton
              type="button"
              onClick={form.testConnection}
              disabled={form.isTesting || form.isConnecting}
            >
              <span>Testar</span>
            </OutlineButton>

            <OutlineButton
              type="button"
              onClick={form.saveProfile}
              disabled={form.isConnecting}
            >
              <span>Salvar</span>
            </OutlineButton>

            <PrimaryButton
              type="button"
              onClick={() => form.connect()}
              disabled={form.isConnecting}
            >
              <Play size={13} fill="currentColor" />
              <span>{form.isConnecting ? 'Conectando...' : 'Conectar'}</span>
            </PrimaryButton>
          </ActionButtons>
        </FooterBar>
      </MainContent>

      {/* Modal de importação por URL */}
      {form.isImportModalOpen && (
        <UrlImportModal
          onClose={() => form.setIsImportModalOpen(false)}
          onApply={form.applyImportedUrl}
        />
      )}
    </Container>
  )
}

