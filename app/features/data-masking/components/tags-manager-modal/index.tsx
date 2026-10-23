import { useState } from 'react'
import { Check, Plus, RotateCcw, Shield, Tags, X } from 'lucide-react'
import type { SensitiveKind, SensitiveTagsConfig } from '../../domain/masking-types'
import { SENSITIVE_KIND_LABELS } from '../../constants'
import { getDatabaseSensitiveTags, resetDatabaseSensitiveTags, saveDatabaseSensitiveTags } from '../../domain/tags-storage'
import {
  Overlay,
  ModalBox,
  ModalHeader,
  TitleGroup,
  ModalTitle,
  CloseButton,
  ModalBody,
  DescriptionText,
  CategoryCard,
  CategoryHeader,
  CategoryTitle,
  TagsContainer,
  TagChip,
  TagRemoveButton,
  AddTagForm,
  AddTagInput,
  AddTagButton,
  ModalFooter,
  ActionGroup,
  SecondaryButton,
  PrimaryButton,
} from './styles'

interface TagsManagerModalProps {
  isOpen: boolean
  onClose: () => void
  connectionId?: string
  databaseName?: string
  onSave: (tags: SensitiveTagsConfig) => void
}

const CATEGORIES: Array<Exclude<SensitiveKind, 'none'>> = [
  'email',
  'cpf_cnpj',
  'phone',
  'password',
  'name',
  'credit_card',
  'address',
  'generic',
]

/**
 * Modal para gerenciar o dicionário de tags de dados sensíveis por banco de dados.
 */
export function TagsManagerModal({
  isOpen,
  onClose,
  connectionId,
  databaseName = 'Banco Atual',
  onSave,
}: TagsManagerModalProps) {
  const [tags, setTags] = useState<SensitiveTagsConfig>(() => getDatabaseSensitiveTags(connectionId))
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleInputChange = (kind: string, value: string) => {
    setNewTagInputs((prev) => ({ ...prev, [kind]: value }))
  }

  const handleAddTag = (kind: Exclude<SensitiveKind, 'none'>) => {
    const rawTag = (newTagInputs[kind] || '').trim().toLowerCase()
    if (!rawTag) return

    setTags((prev) => {
      const currentList = prev[kind] || []
      if (currentList.includes(rawTag)) return prev
      return {
        ...prev,
        [kind]: [...currentList, rawTag],
      }
    })

    setNewTagInputs((prev) => ({ ...prev, [kind]: '' }))
  }

  const handleRemoveTag = (kind: Exclude<SensitiveKind, 'none'>, tagToRemove: string) => {
    setTags((prev) => ({
      ...prev,
      [kind]: (prev[kind] || []).filter((t) => t !== tagToRemove),
    }))
  }

  const handleReset = () => {
    const defaults = resetDatabaseSensitiveTags(connectionId)
    setTags(defaults)
  }

  const handleConfirmSave = () => {
    saveDatabaseSensitiveTags(connectionId, tags)
    onSave(tags)
    onClose()
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <ModalHeader>
          <TitleGroup>
            <Tags size={16} color="var(--brand)" />
            <ModalTitle>Tags de Dados Sensíveis · {databaseName}</ModalTitle>
          </TitleGroup>
          <CloseButton type="button" onClick={onClose} title="Fechar modal">
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <DescriptionText>
            Defina as palavras-chave (tags) que identificam colunas protegidas para este banco de dados. Qualquer
            coluna cujo nome contenha uma dessas tags será automaticamente classificada e protegida no Data Masking.
          </DescriptionText>

          {CATEGORIES.map((kind) => {
            const meta = SENSITIVE_KIND_LABELS[kind]
            const activeList = tags[kind] || []
            const currentInput = newTagInputs[kind] || ''

            return (
              <CategoryCard key={kind}>
                <CategoryHeader>
                  <CategoryTitle $color={meta.color}>
                    <Shield size={12} />
                    <span>{meta.label}</span>
                  </CategoryTitle>
                </CategoryHeader>

                <TagsContainer>
                  {activeList.map((tag) => (
                    <TagChip key={tag} $color={meta.color}>
                      <span>{tag}</span>
                      <TagRemoveButton
                        type="button"
                        onClick={() => handleRemoveTag(kind, tag)}
                        title={`Remover tag "${tag}"`}
                      >
                        <X size={11} />
                      </TagRemoveButton>
                    </TagChip>
                  ))}

                  <AddTagForm
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleAddTag(kind)
                    }}
                  >
                    <AddTagInput
                      type="text"
                      placeholder="Adicionar tag..."
                      value={currentInput}
                      onChange={(e) => handleInputChange(kind, e.target.value)}
                    />
                    <AddTagButton type="submit" title="Adicionar tag">
                      <Plus size={12} />
                    </AddTagButton>
                  </AddTagForm>
                </TagsContainer>
              </CategoryCard>
            )
          })}
        </ModalBody>

        <ModalFooter>
          <SecondaryButton type="button" onClick={handleReset} title="Restaurar dicionário padrão do sistema">
            <RotateCcw size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Restaurar Padrões
          </SecondaryButton>

          <ActionGroup>
            <SecondaryButton type="button" onClick={onClose}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleConfirmSave}>
              <Check size={14} />
              Salvar Tags do Banco
            </PrimaryButton>
          </ActionGroup>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  )
}

