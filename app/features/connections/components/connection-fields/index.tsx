import { useState } from 'react'
import { Eye, EyeOff, FilePlus, FolderOpen, Lock, Sparkles } from 'lucide-react'
import type { ConnectionDraft } from '@/conveyor/connection-contracts'
import { DEFAULT_DATABASE_PORTS, DatabaseDriver } from '@/app/constants/app-constants'
import {
  Section,
  SectionTitle,
  FormGrid,
  FormGroup,
  Label,
  Input,
  PasswordContainer,
  PasswordToggle,
  FilePickerRow,
  FilePathInput,
  SecondaryButton,
  ToggleRow,
  ToggleLabelGroup,
  Switch,
  InfoBanner,
  MutedNote,
} from './styles'

interface ConnectionFieldsProps {
  draft: ConnectionDraft
  onChangeDraft: (updater: (prev: ConnectionDraft) => ConnectionDraft) => void
  onPickSQLite: () => void
  onCreateSQLite: () => void
}

export function ConnectionFields({ draft, onChangeDraft, onPickSQLite, onCreateSQLite }: ConnectionFieldsProps) {
  const [showPassword, setShowPassword] = useState(false)

  if (draft.config.driver === DatabaseDriver.SQLite) {
    return (
      <Section>
        <SectionTitle>Configuração do Arquivo SQLite</SectionTitle>

        <FormGroup>
          <Label>Caminho do Banco de Dados</Label>
          <FilePickerRow>
            <FilePathInput
              readOnly
              placeholder="Selecione ou crie um arquivo .sqlite / .db"
              value={draft.config.path}
            />
            <SecondaryButton type="button" onClick={onPickSQLite}>
              <FolderOpen size={14} />
              <span>Abrir Arquivo</span>
            </SecondaryButton>
            <SecondaryButton type="button" onClick={onCreateSQLite}>
              <FilePlus size={14} />
              <span>Criar Novo</span>
            </SecondaryButton>
          </FilePickerRow>
        </FormGroup>

        <MutedNote>
          Os bancos SQLite rodam em worker thread isolado no Electron com execução rápida e suporte completo a tabelas,
          views e chaves primárias.
        </MutedNote>
      </Section>
    )
  }

  const isPostgres = draft.config.driver === DatabaseDriver.PostgreSQL
  const driverName = isPostgres ? 'PostgreSQL' : 'MySQL'
  const defaultPort = isPostgres
    ? DEFAULT_DATABASE_PORTS[DatabaseDriver.PostgreSQL]
    : DEFAULT_DATABASE_PORTS[DatabaseDriver.MySQL]

  return (
    <Section>
      <SectionTitle>Parâmetros de Conexão {driverName}</SectionTitle>

      <InfoBanner>
        <Sparkles size={16} color="#3b82f6" style={{ flex: 'none', marginTop: 1 }} />
        <div>
          <strong>Conexão Nativa {driverName}: </strong>
          Conecte diretamente a servidores locais (Docker, localhost) ou instâncias na nuvem (AWS RDS, Supabase, Neon, Render, Railway).
        </div>
      </InfoBanner>

      <FormGrid>
        <FormGroup>
          <Label>Host / Servidor</Label>
          <Input
            placeholder="localhost ou 127.0.0.1"
            value={draft.config.host}
            onChange={(e) =>
              onChangeDraft((prev) =>
                prev.config.driver !== 'sqlite'
                  ? { ...prev, config: { ...prev.config, host: e.target.value } }
                  : prev
              )
            }
          />
        </FormGroup>

        <FormGroup>
          <Label>Porta</Label>
          <Input
            type="number"
            placeholder={String(defaultPort)}
            value={draft.config.port}
            onChange={(e) =>
              onChangeDraft((prev) =>
                prev.config.driver !== 'sqlite'
                  ? { ...prev, config: { ...prev.config, port: parseInt(e.target.value, 10) || defaultPort } }
                  : prev
              )
            }
          />
        </FormGroup>
      </FormGrid>

      <FormGrid>
        <FormGroup>
          <Label>Usuário</Label>
          <Input
            placeholder={isPostgres ? 'postgres' : 'root'}
            value={draft.config.user}
            onChange={(e) =>
              onChangeDraft((prev) =>
                prev.config.driver !== 'sqlite'
                  ? { ...prev, config: { ...prev.config, user: e.target.value } }
                  : prev
              )
            }
          />
        </FormGroup>

        <FormGroup>
          <Label>Senha</Label>
          <PasswordContainer>
            <Input
              style={{ width: '100%', paddingRight: 32 }}
              type={showPassword ? 'text' : 'password'}
              placeholder={draft.id && !draft.password ? '•••••••• (salva no cofre)' : 'Digite a senha'}
              value={draft.password || ''}
              onChange={(e) => onChangeDraft((prev) => ({ ...prev, password: e.target.value }))}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? 'Ocultar' : 'Exibir'}
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            </PasswordToggle>
          </PasswordContainer>
        </FormGroup>
      </FormGrid>

      <FormGroup>
        <Label>Banco de Dados Padrão</Label>
        <Input
          placeholder="Ex: postgres, sakila, production"
          value={draft.config.database}
          onChange={(e) =>
            onChangeDraft((prev) =>
              prev.config.driver !== 'sqlite'
                ? { ...prev, config: { ...prev.config, database: e.target.value } }
                : prev
            )
          }
        />
      </FormGroup>

      <ToggleRow>
        <ToggleLabelGroup>
          <Lock size={14} color="var(--brand)" />
          <div>
            <div>Habilitar SSL / TLS</div>
            <div style={{ fontSize: 10, color: 'var(--foreground-muted)' }}>
              Conexão criptografada para ambientes remotos e nuvem
            </div>
          </div>
        </ToggleLabelGroup>
        <Switch
          checked={draft.config.ssl}
          onChange={(e) =>
            onChangeDraft((prev) =>
              prev.config.driver !== 'sqlite' ? { ...prev, config: { ...prev.config, ssl: e.target.checked } } : prev
            )
          }
        />
      </ToggleRow>
    </Section>
  )
}
