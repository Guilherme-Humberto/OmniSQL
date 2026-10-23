import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Bot,
  Check,
  Copy,
  Download,
  FileCode,
  Network,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import type { DatabaseColumn, DatabaseForeignKey, DatabaseTable } from '@/conveyor/database-contracts'
import { UI_TIMEOUTS } from '@/app/constants/app-constants'
import { DOCUMENTATION_TABS, DocumentationTab } from '../../constants'
import type { ColumnCommentSuggestion, TableDocumentationMeta } from '../../domain/types'
import { generateMarkdownDictionary } from '../../domain/dictionary-generator'
import { generateMermaidErDiagram } from '../../domain/mermaid-generator'
import { generateSqlCommentStatements } from '../../domain/sql-comment-generator'
import { buildAiDocumenterPrompt, parseAiDocumenterResponse } from '../../domain/ai-documenter-prompt'
import {
  Overlay,
  ModalBox,
  ModalHeader,
  HeaderTitleGroup,
  ModalTitle,
  HeaderBadge,
  CloseButton,
  TabBar,
  TabItem,
  TabBadge,
  ModalBody,
  CodeCard,
  CodeCardHeader,
  CodeCardTitle,
  HeaderActions,
  ActionButton,
  CodeBox,
  AiBanner,
  AiInfoGroup,
  AiModelSelect,
  SuggestionGrid,
  SuggestionRow,
  SuggestionField,
  TableTag,
  ColName,
  CommentInput,
  ModalFooter,
  FooterSummary,
  ActionGroup,
  SecondaryButton,
  PrimaryButton,
} from './styles'

interface DocumentationModalProps {
  isOpen: boolean
  onClose: () => void
  connectionId: string
  connectionName: string
  driver: 'sqlite' | 'postgres' | 'mysql'
  tables: DatabaseTable[]
}

/**
 * Modal central de documentação do banco de dados: Dicionário Markdown, Diagrama ER Mermaid e IA Local.
 */
export function DocumentationModal({
  isOpen,
  onClose,
  connectionId,
  connectionName,
  driver,
  tables,
}: DocumentationModalProps) {
  const [activeTab, setActiveTab] = useState<DocumentationTab>(DocumentationTab.Dictionary)
  const [copiedTab, setCopiedTab] = useState<DocumentationTab | null>(null)

  // Metadados completos de colunas por tabela
  const [columnsByTable, setColumnsByTable] = useState<Record<string, DatabaseColumn[]>>({})

  // Chaves estrangeiras consultadas no catálogo
  const { data: foreignKeysMap } = conveyor.database.foreignKeys.useQuery({
    input: connectionId,
    enabled: Boolean(connectionId) && isOpen,
  })

  // Consulta de status e modelos do Ollama local
  const { data: aiStatus } = conveyor.ai.status.useQuery({
    enabled: isOpen,
  })

  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [suggestions, setSuggestions] = useState<ColumnCommentSuggestion[]>([])
  const [aiError, setAiError] = useState<string | null>(null)
  const [appliedCount, setAppliedCount] = useState<number | null>(null)

  // Atualiza modelo padrão do Ollama
  useEffect(() => {
    if (aiStatus?.defaultModel && !selectedModel) {
      setSelectedModel(aiStatus.defaultModel)
    } else if (aiStatus?.models?.[0] && !selectedModel) {
      setSelectedModel(aiStatus.models[0])
    }
  }, [aiStatus, selectedModel])

  // Carrega colunas de todas as tabelas ao abrir
  useEffect(() => {
    if (!isOpen || !connectionId || tables.length === 0) return

    let isMounted = true
    const loadAllColumns = async () => {
      const map: Record<string, DatabaseColumn[]> = {}
      for (const t of tables) {
        try {
          const cols = await conveyor.database.columns({ connectionId, tableName: t.name })
          map[t.name] = cols
        } catch {
          map[t.name] = []
        }
      }
      if (isMounted) setColumnsByTable(map)
    }

    void loadAllColumns()
    return () => {
      isMounted = false
    }
  }, [isOpen, connectionId, tables])

  // Monta a estrutura consolidada de entidades
  const metaTables: TableDocumentationMeta[] = useMemo(() => {
    return tables.map((t) => {
      const columns = columnsByTable[t.name] || []
      const fks: DatabaseForeignKey[] = (foreignKeysMap && foreignKeysMap[t.name]) || []
      return {
        name: t.name,
        kind: t.kind,
        columns,
        foreignKeys: fks,
      }
    })
  }, [tables, columnsByTable, foreignKeysMap])

  // 1. Gera Dicionário Markdown
  const markdownContent = useMemo(() => {
    return generateMarkdownDictionary({
      databaseName: connectionName,
      driver,
      tables: metaTables,
    })
  }, [connectionName, driver, metaTables])

  // 2. Gera Diagrama Mermaid ER
  const mermaidContent = useMemo(() => {
    return generateMermaidErDiagram(metaTables)
  }, [metaTables])

  // 3. Gera Script SQL de Comentários
  const sqlCommentScript = useMemo(() => {
    return generateSqlCommentStatements(driver, suggestions)
  }, [driver, suggestions])

  const copyToClipboard = async (content: string, tabId: DocumentationTab) => {
    await navigator.clipboard.writeText(content)
    setCopiedTab(tabId)
    setTimeout(() => setCopiedTab(null), UI_TIMEOUTS.COPY_FEEDBACK_MS)
  }

  const downloadFile = (content: string, filename: string, mime = 'text/markdown;charset=utf-8;') => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Executa o documentador automático via IA Local
  const handleGenerateAiComments = async () => {
    if (!selectedModel) {
      setAiError('Selecione um modelo local no Ollama.')
      return
    }

    setIsGeneratingAi(true)
    setAiError(null)
    setAppliedCount(null)

    try {
      const payloadTables = metaTables.slice(0, 15).map((t) => ({
        tableName: t.name,
        columns: t.columns.map((c) => ({ name: c.name, type: c.type })),
      }))

      const { systemPrompt, userPrompt } = buildAiDocumenterPrompt(payloadTables)

      // Faz a requisição ao Ollama local
      const res = await conveyor.ai.generate({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        mode: 'query',
        driver,
        model: selectedModel,
      })

      const parsed = parseAiDocumenterResponse(res.explanation || res.sql, payloadTables)
      setSuggestions(parsed)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Falha ao conectar com o Ollama.')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleUpdateSuggestion = (index: number, newComment: string) => {
    setSuggestions((prev) => {
      const copy = [...prev]
      const target = copy[index]
      if (target) {
        copy[index] = { ...target, suggestedComment: newComment }
      }
      return copy
    })
  }

  const handleToggleApproved = (index: number) => {
    setSuggestions((prev) => {
      const copy = [...prev]
      const target = copy[index]
      if (target) {
        copy[index] = { ...target, approved: !target.approved }
      }
      return copy
    })
  }

  const handleApplyToDatabase = async () => {
    const script = sqlCommentScript
    if (!script.trim()) return

    try {
      await conveyor.database.execute({ connectionId, sql: script })
      const count = suggestions.filter((s) => s.approved).length
      setAppliedCount(count)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Falha ao executar comandos DDL no banco.')
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <ModalHeader>
          <HeaderTitleGroup>
            <BookOpen size={18} color="var(--brand)" />
            <ModalTitle>Documentação do Banco de Dados</ModalTitle>
            <HeaderBadge>{driver.toUpperCase()}</HeaderBadge>
          </HeaderTitleGroup>
          <CloseButton type="button" onClick={onClose} title="Fechar modal">
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <TabBar>
          {DOCUMENTATION_TABS.map((tab) => (
            <TabItem
              key={tab.id}
              type="button"
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.id === DocumentationTab.Dictionary && <FileCode size={14} />}
              {tab.id === DocumentationTab.Mermaid && <Network size={14} />}
              {tab.id === DocumentationTab.AiDoc && <Bot size={14} />}
              <span>{tab.label}</span>
              {tab.badge && <TabBadge>{tab.badge}</TabBadge>}
            </TabItem>
          ))}
        </TabBar>

        <ModalBody>
          {/* Aba 1: Dicionário de Dados Markdown */}
          {activeTab === DocumentationTab.Dictionary && (
            <CodeCard>
              <CodeCardHeader>
                <CodeCardTitle>Dicionário Formatado em Markdown (Compatível com Notion / Obsidian)</CodeCardTitle>
                <HeaderActions>
                  <ActionButton
                    type="button"
                    onClick={() => void copyToClipboard(markdownContent, DocumentationTab.Dictionary)}
                  >
                    {copiedTab === DocumentationTab.Dictionary ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedTab === DocumentationTab.Dictionary ? 'Copiado!' : 'Copiar Markdown'}</span>
                  </ActionButton>
                  <ActionButton
                    type="button"
                    onClick={() => downloadFile(markdownContent, `${connectionName}_dicionario.md`)}
                  >
                    <Download size={12} />
                    <span>Baixar .md</span>
                  </ActionButton>
                </HeaderActions>
              </CodeCardHeader>
              <CodeBox>{markdownContent}</CodeBox>
            </CodeCard>
          )}

          {/* Aba 2: Diagrama ER Mermaid.js */}
          {activeTab === DocumentationTab.Mermaid && (
            <CodeCard>
              <CodeCardHeader>
                <CodeCardTitle>Código Mermaid.js (Cole em blocos ```mermaid no GitHub ou Notion)</CodeCardTitle>
                <HeaderActions>
                  <ActionButton
                    type="button"
                    onClick={() => void copyToClipboard(mermaidContent, DocumentationTab.Mermaid)}
                  >
                    {copiedTab === DocumentationTab.Mermaid ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedTab === DocumentationTab.Mermaid ? 'Copiado!' : 'Copiar Mermaid'}</span>
                  </ActionButton>
                  <ActionButton
                    type="button"
                    onClick={() =>
                      downloadFile(mermaidContent, `${connectionName}_diagrama.mmd`, 'text/plain;charset=utf-8;')
                    }
                  >
                    <Download size={12} />
                    <span>Baixar .mmd</span>
                  </ActionButton>
                </HeaderActions>
              </CodeCardHeader>
              <CodeBox>{mermaidContent}</CodeBox>
            </CodeCard>
          )}

          {/* Aba 3: Auto-Documentador IA Local */}
          {activeTab === DocumentationTab.AiDoc && (
            <>
              <AiBanner>
                <AiInfoGroup>
                  <Bot size={20} color="var(--brand)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
                      Auto-Documentador Semântico (Ollama Offline)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
                      Analisa siglas e nomes crípticos de colunas para sugerir descrições legíveis sem expor dados.
                    </div>
                  </div>
                </AiInfoGroup>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AiModelSelect
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isGeneratingAi || !aiStatus?.models?.length}
                  >
                    {aiStatus?.models?.length ? (
                      aiStatus.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))
                    ) : (
                      <option value="">Nenhum modelo (Ollama offline)</option>
                    )}
                  </AiModelSelect>

                  <PrimaryButton
                    type="button"
                    onClick={() => void handleGenerateAiComments()}
                    disabled={isGeneratingAi || !selectedModel}
                  >
                    <Sparkles size={13} />
                    <span>{isGeneratingAi ? 'Analisando...' : 'Sugerir com IA'}</span>
                  </PrimaryButton>
                </div>
              </AiBanner>

              {aiError && (
                <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '12px' }}>
                  {aiError}
                </div>
              )}

              {appliedCount !== null && (
                <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '12px' }}>
                  Sucesso: {appliedCount} comentários foram aplicados no banco com comandos DDL!
                </div>
              )}

              {suggestions.length > 0 && (
                <CodeCard>
                  <CodeCardHeader>
                    <CodeCardTitle>Sugestões Semânticas de Colunas (Revise antes de aplicar)</CodeCardTitle>
                    <HeaderActions>
                      <ActionButton
                        type="button"
                        onClick={() => void copyToClipboard(sqlCommentScript, DocumentationTab.SqlComments)}
                      >
                        {copiedTab === DocumentationTab.SqlComments ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span>{copiedTab === DocumentationTab.SqlComments ? 'Copiado!' : 'Copiar Script SQL'}</span>
                      </ActionButton>
                    </HeaderActions>
                  </CodeCardHeader>

                  <SuggestionGrid>
                    {suggestions.map((item, idx) => (
                      <SuggestionRow key={`${item.tableName}-${item.columnName}-${idx}`}>
                        <input
                          type="checkbox"
                          checked={item.approved}
                          onChange={() => handleToggleApproved(idx)}
                          title="Marcar para inclusão"
                        />
                        <SuggestionField>
                          <TableTag>{item.tableName}</TableTag>
                          <ColName>{item.columnName}</ColName>
                        </SuggestionField>
                        <CommentInput
                          type="text"
                          value={item.suggestedComment}
                          onChange={(e) => handleUpdateSuggestion(idx, e.target.value)}
                          placeholder="Descrição do campo..."
                        />
                      </SuggestionRow>
                    ))}
                  </SuggestionGrid>
                </CodeCard>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <FooterSummary>
            {tables.length} tabelas analisadas · {Object.values(columnsByTable).reduce((acc, c) => acc + c.length, 0)} colunas
          </FooterSummary>

          <ActionGroup>
            {activeTab === DocumentationTab.AiDoc && suggestions.length > 0 && (
              <PrimaryButton type="button" onClick={() => void handleApplyToDatabase()}>
                <Play size={13} fill="currentColor" />
                <span>Aplicar no Banco ({suggestions.filter((s) => s.approved).length})</span>
              </PrimaryButton>
            )}
            <SecondaryButton type="button" onClick={onClose}>
              Fechar
            </SecondaryButton>
          </ActionGroup>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  )
}
