import { useState, useMemo } from 'react'
import { Check, Code2, Copy, Download, X } from 'lucide-react'
import type { DatabaseQueryResult } from '@/conveyor/database-contracts'
import { TARGET_CATALOG, type CodeTarget } from '../../features/code-generator/domain/types'
import { generateSnippet } from '../../features/code-generator/strategies'
import { UI_TIMEOUTS } from '@/app/constants/app-constants'
import {
  Overlay,
  ModalBox,
  ModalHeader,
  HeaderTitleGroup,
  ModalTitle,
  HeaderBadge,
  CloseButton,
  TargetBar,
  TargetPill,
  TargetBadge,
  CodeBody,
  CodeScroll,
  ModalFooter,
  FooterOptions,
  CheckboxLabel,
  FooterActions,
  SecondaryButton,
  PrimaryButton,
} from './styles'

interface CodeGeneratorModalProps {
  sql: string
  result: DatabaseQueryResult | null
  onClose: () => void
}

/**
 * Modal para geração de snippets em ORMs e APIs (SOLID - Strategy Pattern desacoplado).
 */
export function CodeGeneratorModal({ sql, result, onClose }: CodeGeneratorModalProps) {
  const [target, setTarget] = useState<CodeTarget>('prisma')
  const [includeTypes, setIncludeTypes] = useState(true)
  const [copied, setCopied] = useState(false)

  const currentTargetInfo = useMemo(() => TARGET_CATALOG.find((t) => t.id === target)!, [target])
  const code = useMemo(
    () => generateSnippet(target, { sql, result, includeTypes }),
    [target, sql, result, includeTypes]
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), UI_TIMEOUTS.COPY_FEEDBACK_MS)
    } catch {
      // fallback
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `query-service.${currentTargetInfo.ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitleGroup>
            <Code2 size={16} color="var(--brand)" />
            <ModalTitle>Gerador de Código ORM & API</ModalTitle>
            <HeaderBadge>One-Click Export</HeaderBadge>
          </HeaderTitleGroup>

          <CloseButton type="button" onClick={onClose} title="Fechar (Esc)">
            <X size={15} />
          </CloseButton>
        </ModalHeader>

        {/* Barra de seleção de frameworks com Strategy Pattern */}
        <TargetBar>
          {TARGET_CATALOG.map((t) => {
            const isSelected = t.id === target
            return (
              <TargetPill
                key={t.id}
                type="button"
                $active={isSelected}
                $color={t.color}
                onClick={() => setTarget(t.id)}
              >
                <span>{t.name}</span>
                <TargetBadge $color={t.color}>{t.badge}</TargetBadge>
              </TargetPill>
            )
          })}
        </TargetBar>

        {/* Visualização de código */}
        <CodeBody>
          <CodeScroll>{code}</CodeScroll>
        </CodeBody>

        {/* Opções e Ações */}
        <ModalFooter>
          <FooterOptions>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={includeTypes}
                onChange={(e) => setIncludeTypes(e.target.checked)}
              />
              <span>Gerar tipos / DTOs a partir do resultado</span>
            </CheckboxLabel>
          </FooterOptions>

          <FooterActions>
            <SecondaryButton type="button" onClick={handleDownload} title="Baixar arquivo de código">
              <Download size={13} />
              <span>Baixar .{currentTargetInfo.ext}</span>
            </SecondaryButton>

            <PrimaryButton type="button" onClick={handleCopy}>
              {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
              <span>{copied ? 'Copiado!' : 'Copiar Snippet'}</span>
            </PrimaryButton>
          </FooterActions>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  )
}

