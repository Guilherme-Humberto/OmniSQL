import { Check, ShieldCheck } from 'lucide-react'
import { CONNECTION_COLORS, type ConnectionDraft } from '@/conveyor/connection-contracts'
import { DatabaseDriver } from '@/app/constants/app-constants'
import { COLOR_MAP } from '../../constants'
import {
  Section,
  SectionTitle,
  FormGrid,
  FormGroup,
  Label,
  Input,
  ColorPicker,
  ColorDot,
  ToggleRow,
  ToggleLabelGroup,
  Switch,
  SecurityDescription,
} from './styles'

interface ConnectionIdentityProps {
  draft: ConnectionDraft
  onChangeDraft: (updater: (prev: ConnectionDraft) => ConnectionDraft) => void
}

export function ConnectionIdentity({ draft, onChangeDraft }: ConnectionIdentityProps) {
  return (
    <Section>
      <SectionTitle>Identificação & Segurança</SectionTitle>

      <FormGrid>
        <FormGroup>
          <Label>Nome de Exibição da Conexão</Label>
          <Input
            placeholder="Ex: [DEV] Docker Postgres"
            value={draft.name}
            onChange={(e) => onChangeDraft((prev) => ({ ...prev, name: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <Label>Cor do Marcador</Label>
          <ColorPicker>
            {CONNECTION_COLORS.map((colorKey) => {
              const colorData = COLOR_MAP[colorKey]
              const isSelected = draft.color === colorKey
              return (
                <ColorDot
                  key={colorKey}
                  type="button"
                  $colorHex={colorData.hex}
                  $selected={isSelected}
                  onClick={() => onChangeDraft((prev) => ({ ...prev, color: colorKey }))}
                  title={colorKey}
                >
                  {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
                </ColorDot>
              )
            })}
          </ColorPicker>
        </FormGroup>
      </FormGrid>

      {draft.config.driver !== DatabaseDriver.SQLite && (
        <ToggleRow>
          <ToggleLabelGroup>
            <ShieldCheck size={15} color="var(--success)" />
            <div>
              <div>Salvar Senhas com Segurança</div>
              <SecurityDescription>
                Criptografado usando safeStorage nativo do sistema operacional (libsecret / Keychain / DPAPI)
              </SecurityDescription>
            </div>
          </ToggleLabelGroup>
          <Switch
            checked={draft.savePassword}
            onChange={(e) => onChangeDraft((prev) => ({ ...prev, savePassword: e.target.checked }))}
          />
        </ToggleRow>
      )}
    </Section>
  )
}
