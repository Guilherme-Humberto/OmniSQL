import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { ConnectionDraft } from '@/conveyor/connection-contracts'
import { parseUrlToDraft } from '../../url-parser'
import {
  ModalOverlay,
  ModalBox,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Description,
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  ModalFooter,
  OutlineButton,
  PrimaryButton,
} from './styles'

interface UrlImportModalProps {
  onClose: () => void
  onApply: (draftPatch: Partial<ConnectionDraft>) => void
}

export function UrlImportModal({ onClose, onApply }: UrlImportModalProps) {
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)

  const handleApply = () => {
    setUrlError(null)
    if (!urlInput.trim()) {
      setUrlError('Insira uma URL de conexão válida.')
      return
    }

    const parsed = parseUrlToDraft(urlInput.trim())
    if (!parsed) {
      setUrlError('Formato inválido. Exemplos suportados: postgres://user:pass@host:5432/db ou sqlite:///caminho')
      return
    }

    onApply(parsed)
    onClose()
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Importar Conexão por URL</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={14} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Description>
            Cole a URL de conexão do seu banco de dados. Os parâmetros de host, porta, usuário, banco e SSL serão
            preenchidos automaticamente.
          </Description>

          <FormGroup>
            <Label>URL de Conexão</Label>
            <Input
              autoFocus
              placeholder="postgres://user:password@localhost:5432/database"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
          </FormGroup>

          {urlError && (
            <ErrorMessage>
              <AlertTriangle size={13} />
              <span>{urlError}</span>
            </ErrorMessage>
          )}
        </ModalBody>

        <ModalFooter>
          <OutlineButton type="button" onClick={onClose}>
            Cancelar
          </OutlineButton>
          <PrimaryButton type="button" onClick={handleApply}>
            Importar
          </PrimaryButton>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  )
}
