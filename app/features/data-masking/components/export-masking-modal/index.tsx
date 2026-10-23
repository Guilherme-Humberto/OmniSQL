import { useMemo, useState } from 'react'
import {
  Check,
  CheckSquare,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Search,
  Shield,
  ShieldCheck,
  Square,
  X,
} from 'lucide-react'
import type { DatabaseCell } from '@/conveyor/database-contracts'
import {
  ExportFormat,
  MaskRule,
  type ColumnMaskConfig,
} from '../../domain/masking-types'
import { transformRowsWithMasking } from '../../domain/masking-engine'
import { serializeToCsv, serializeToJson, serializeToSqlInserts } from '../../domain/export-serializers'
import { EXPORT_FORMAT_OPTIONS, MASK_RULES_OPTIONS } from '../../constants'
import {
  Overlay,
  ModalBox,
  ModalHeader,
  HeaderTitleGroup,
  ModalTitle,
  HeaderBadge,
  CloseButton,
  ModalBody,
  ControlCard,
  SectionHeader,
  SectionTitle,
  FormatSelector,
  FormatButton,
  QuickActions,
  QuickButton,
  CheckboxLabel,
  StyledCheckbox,
  RuleBadge,
  SearchBox,
  SearchInput,
  BulkRuleSelect,
  ColumnsTable,
  ColumnRow,
  ColumnDetails,
  ColumnName,
  SelectRule,
  PreviewCard,
  PreviewScroll,
  PreviewTable,
  PreviewTh,
  PreviewTd,
  ModalFooter,
  FooterSummary,
  ActionGroup,
  SecondaryButton,
  PrimaryButton,
} from './styles'

interface ExportMaskingModalProps {
  isOpen: boolean
  onClose: () => void
  columns: string[]
  rows: DatabaseCell[][]
  tableName?: string
  connectionId?: string
}

const PREVIEW_ROW_COUNT = 4

/**
 * Modal de anonimização e exportação de dados (LGPD / GDPR).
 * Permite ao usuário marcar qualquer campo da tabela e definir a regra exata de anonimização.
 */
export function ExportMaskingModal({
  isOpen,
  onClose,
  columns,
  rows,
  tableName = 'tabela',
}: ExportMaskingModalProps) {
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.Csv)
  const [filterText, setFilterText] = useState('')
  const [bulkRule, setBulkRule] = useState<MaskRule>(MaskRule.Mask)

  // Configuração por campo: por padrão os campos começam desmarcados (originais)
  // O usuário tem total controle sobre quais campos marcar e qual regra aplicar.
  const [configs, setConfigs] = useState<Record<string, ColumnMaskConfig>>(() => {
    const initial: Record<string, ColumnMaskConfig> = {}
    for (const col of columns) {
      initial[col] = {
        columnName: col,
        enabled: false,
        rule: MaskRule.Mask,
      }
    }
    return initial
  })

  // Quantidade de campos marcados para anonimização
  const markedCount = useMemo(() => {
    return Object.values(configs).filter((c) => c.enabled && c.rule !== MaskRule.None).length
  }, [configs])

  // Alterna marcação de uma coluna individual
  const handleToggleColumn = (colName: string) => {
    setConfigs((prev) => {
      const existing = prev[colName]
      const wasEnabled = existing?.enabled ?? false
      const currentRule = existing?.rule && existing.rule !== MaskRule.None ? existing.rule : MaskRule.Mask

      return {
        ...prev,
        [colName]: {
          columnName: colName,
          enabled: !wasEnabled,
          rule: currentRule,
        },
      }
    })
  }

  // Altera a regra de uma coluna individual
  const handleRuleChange = (colName: string, rule: MaskRule) => {
    setConfigs((prev) => {
      return {
        ...prev,
        [colName]: {
          columnName: colName,
          enabled: rule !== MaskRule.None,
          rule,
        },
      }
    })
  }

  // Marca todos os campos com a regra padrão
  const handleSelectAll = () => {
    setConfigs((prev) => {
      const next: Record<string, ColumnMaskConfig> = {}
      for (const col of columns) {
        const existing = prev[col]
        next[col] = {
          columnName: col,
          enabled: true,
          rule: existing?.rule && existing.rule !== MaskRule.None ? existing.rule : bulkRule,
        }
      }
      return next
    })
  }

  // Desmarca todos os campos (todos voltam a ser originais)
  const handleDeselectAll = () => {
    setConfigs((prev) => {
      const next: Record<string, ColumnMaskConfig> = {}
      for (const col of columns) {
        next[col] = {
          columnName: col,
          enabled: false,
          rule: prev[col]?.rule || MaskRule.Mask,
        }
      }
      return next
    })
  }

  // Aplica uma regra selecionada a todos os campos que estão marcados atualmente
  const handleApplyRuleToMarked = (rule: MaskRule) => {
    setBulkRule(rule)
    setConfigs((prev) => {
      const next: Record<string, ColumnMaskConfig> = {}
      for (const [col, conf] of Object.entries(prev)) {
        if (conf.enabled) {
          next[col] = {
            ...conf,
            rule,
          }
        } else {
          next[col] = conf
        }
      }
      return next
    })
  }

  // Colunas filtradas pelo campo de busca
  const filteredColumns = useMemo(() => {
    if (!filterText.trim()) return columns
    const lower = filterText.toLowerCase()
    return columns.filter((col) => col.toLowerCase().includes(lower))
  }, [columns, filterText])

  // Pré-visualização em tempo real das primeiras linhas
  const previewRows = useMemo(() => {
    const sample = rows.slice(0, PREVIEW_ROW_COUNT)
    return transformRowsWithMasking(columns, sample, configs)
  }, [columns, rows, configs])

  // Execução da exportação com as regras aplicadas
  const handleExport = () => {
    const maskedRows = transformRowsWithMasking(columns, rows, configs)
    const selectedFormat = EXPORT_FORMAT_OPTIONS.find((f) => f.format === format) || EXPORT_FORMAT_OPTIONS[0]!

    let content = ''
    if (format === ExportFormat.Csv) {
      content = serializeToCsv(columns, maskedRows, { delimiter: ',' })
    } else if (format === ExportFormat.Json) {
      content = serializeToJson(columns, maskedRows, true)
    } else if (format === ExportFormat.Sql) {
      content = serializeToSqlInserts(columns, maskedRows, { tableName })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `${tableName}_anonimizado_${timestamp}${selectedFormat.extension}`

    const blob = new Blob([content], { type: selectedFormat.mime })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    onClose()
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <ModalHeader>
          <HeaderTitleGroup>
            <ShieldCheck size={18} color="#10b981" />
            <ModalTitle>Anonimização e Exportação: {tableName}</ModalTitle>
            <HeaderBadge>
              <Shield size={12} />
              LGPD / GDPR
            </HeaderBadge>
          </HeaderTitleGroup>
          <CloseButton type="button" onClick={onClose} title="Fechar modal">
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Seletor de Formato */}
          <ControlCard>
            <SectionHeader>
              <SectionTitle>Formato do Arquivo de Exportação</SectionTitle>
            </SectionHeader>
            <FormatSelector>
              {EXPORT_FORMAT_OPTIONS.map((opt) => (
                <FormatButton
                  key={opt.format}
                  type="button"
                  $active={format === opt.format}
                  onClick={() => setFormat(opt.format)}
                >
                  {opt.format === ExportFormat.Csv && <FileSpreadsheet size={14} />}
                  {opt.format === ExportFormat.Json && <FileText size={14} />}
                  {opt.format === ExportFormat.Sql && <Download size={14} />}
                  <span>{opt.label}</span>
                </FormatButton>
              ))}
            </FormatSelector>
          </ControlCard>

          {/* Configuração de Campos e Regras pelo Usuário */}
          <ControlCard>
            <SectionHeader>
              <SectionTitle>
                Campos para Anonimização ({markedCount} de {columns.length} marcados)
              </SectionTitle>
              <QuickActions>
                <SearchBox>
                  <Search size={12} />
                  <SearchInput
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filtrar campos..."
                  />
                </SearchBox>

                <QuickButton type="button" onClick={handleSelectAll} title="Marcar todos os campos da tabela">
                  <CheckSquare size={11} />
                  Marcar Todos
                </QuickButton>

                <QuickButton type="button" onClick={handleDeselectAll} title="Desmarcar todos os campos">
                  <Square size={11} />
                  Desmarcar Todos
                </QuickButton>

                {markedCount > 0 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>Regra p/ Marcados:</span>
                    <BulkRuleSelect
                      value={bulkRule}
                      onChange={(e) => handleApplyRuleToMarked(e.target.value as MaskRule)}
                    >
                      {MASK_RULES_OPTIONS.filter((r) => r.value !== MaskRule.None).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </BulkRuleSelect>
                  </div>
                )}
              </QuickActions>
            </SectionHeader>

            <ColumnsTable>
              {filteredColumns.map((columnName) => {
                const config = configs[columnName] || {
                  columnName,
                  enabled: false,
                  rule: MaskRule.Mask,
                }
                const isMarked = Boolean(config.enabled) && config.rule !== MaskRule.None
                const activeRuleLabel = MASK_RULES_OPTIONS.find((r) => r.value === config.rule)?.label || 'Anonimizado'

                return (
                  <ColumnRow key={columnName}>
                    <ColumnDetails>
                      <CheckboxLabel>
                        <StyledCheckbox
                          type="checkbox"
                          checked={isMarked}
                          onChange={() => handleToggleColumn(columnName)}
                          aria-label={`Anonimizar campo ${columnName}`}
                        />
                        <ColumnName>{columnName}</ColumnName>
                      </CheckboxLabel>

                      <RuleBadge $active={isMarked}>
                        {isMarked ? (
                          <>
                            <Shield size={9} />
                            {activeRuleLabel}
                          </>
                        ) : (
                          'Original'
                        )}
                      </RuleBadge>
                    </ColumnDetails>

                    <SelectRule
                      value={isMarked ? config.rule : MaskRule.None}
                      onChange={(e) => handleRuleChange(columnName, e.target.value as MaskRule)}
                      aria-label={`Regra para o campo ${columnName}`}
                    >
                      {MASK_RULES_OPTIONS.map((ruleOpt) => (
                        <option key={ruleOpt.value} value={ruleOpt.value}>
                          {ruleOpt.label}
                        </option>
                      ))}
                    </SelectRule>
                  </ColumnRow>
                )
              })}

              {!filteredColumns.length && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '12px' }}>
                  Nenhum campo corresponde ao filtro informado.
                </div>
              )}
            </ColumnsTable>
          </ControlCard>

          {/* Pré-visualização em Tempo Real */}
          <PreviewCard>
            <SectionHeader style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
              <SectionTitle style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={13} />
                Pré-visualização dos Dados ({markedCount > 0 ? `${markedCount} campos transformados` : 'dados originais'})
              </SectionTitle>
            </SectionHeader>
            <PreviewScroll>
              <PreviewTable>
                <thead>
                  <tr>
                    <PreviewTh>#</PreviewTh>
                    {columns.map((col) => {
                      const isColMarked = Boolean(configs[col]?.enabled) && (configs[col]?.rule ?? MaskRule.None) !== MaskRule.None
                      return (
                        <PreviewTh key={col} style={{ color: isColMarked ? 'var(--brand)' : undefined }}>
                          {col} {isColMarked ? '🛡️' : ''}
                        </PreviewTh>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <PreviewTd>{rIdx + 1}</PreviewTd>
                      {row.map((cell, cIdx) => {
                        const colName = columns[cIdx] || ''
                        const isMasked = Boolean(configs[colName]?.enabled) && (configs[colName]?.rule ?? MaskRule.None) !== MaskRule.None
                        const displayVal =
                          cell === null
                            ? 'NULL'
                            : typeof cell === 'object'
                              ? `BLOB(${cell.base64.slice(0, 6)})`
                              : String(cell)
                        return (
                          <PreviewTd key={cIdx} $masked={isMasked} title={displayVal}>
                            {displayVal}
                          </PreviewTd>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </PreviewTable>
            </PreviewScroll>
          </PreviewCard>
        </ModalBody>

        <ModalFooter>
          <FooterSummary>
            {markedCount > 0 ? (
              <>
                <strong>{markedCount}</strong> de {columns.length} campos selecionados para anonimização ·{' '}
                {rows.length.toLocaleString('pt-BR')} linhas prontas
              </>
            ) : (
              `Nenhum campo marcado para anonimização · ${rows.length.toLocaleString('pt-BR')} linhas originais`
            )}
          </FooterSummary>

          <ActionGroup>
            <SecondaryButton type="button" onClick={onClose}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleExport}>
              <Check size={14} />
              Exportar Arquivo
            </PrimaryButton>
          </ActionGroup>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  )
}

