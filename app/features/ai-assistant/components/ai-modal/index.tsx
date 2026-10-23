import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Database,
  FileCode,
  Loader2,
  ShieldAlert,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import { AiMode, type AiTableSummary } from '@/conveyor/ai-contracts'
import { AI_MODES, DEFAULT_AI_MODELS } from '../../constants'
import { AiStatusBadge } from '../ai-status-badge'
import {
  ModalOverlay,
  ModalBox,
  ModalHeader,
  HeaderTitleGroup,
  HeaderTitle,
  CloseButton,
  ModalBody,
  ModeTabBar,
  ModeTabButton,
  ControlRow,
  ModelSelectGroup,
  Select,
  SafetyBadge,
  PromptTextarea,
  ExamplesRow,
  ExamplesLabel,
  ChipsWrap,
  Chip,
  OfflineNotice,
  ResultContainer,
  ResultHeader,
  SqlPreview,
  ExplanationBox,
  ModalFooter,
  ButtonGroup,
  OutlineButton,
  PrimaryButton,
  InsertButton,
} from './styles'

interface AiModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertSql: (sql: string) => void
  onOpenInNewTab?: (sql: string) => void
  driver: 'sqlite' | 'postgres' | 'mysql'
  schemaTables?: AiTableSummary[]
}

export function AiModal({
  isOpen,
  onClose,
  onInsertSql,
  onOpenInNewTab,
  driver,
  schemaTables,
}: AiModalProps) {
  const [mode, setMode] = useState<AiMode>(AiMode.Query)
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('qwen2.5-coder:7b')
  const [copied, setCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [generatedSql, setGeneratedSql] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Status de conectividade com o Ollama local
  const { data: status, isLoading: isStatusLoading, refetch: refetchStatus } = conveyor.ai.status.useQuery()

  // Sincroniza o modelo padrão detectado no Ollama
  useEffect(() => {
    if (status?.defaultModel) {
      setSelectedModel(status.defaultModel)
    } else if (status?.models && status.models.length > 0 && status.models[0]) {
      setSelectedModel(status.models[0])
    }
  }, [status])

  // Fecha o modal ao pressionar Escape
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activeModeConfig = AI_MODES[mode]
  const availableModels = status?.isOnline && status.models.length > 0 ? status.models : DEFAULT_AI_MODELS

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    setErrorMessage(null)
    setIsGenerating(true)

    try {
      const result = await conveyor.ai.generate({
        prompt: prompt.trim(),
        mode,
        driver,
        model: selectedModel,
        schema: schemaTables,
      })

      setGeneratedSql(result.sql)
      setExplanation(result.explanation)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao comunicar com o Ollama local'
      setErrorMessage(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedSql) return
    await navigator.clipboard.writeText(generatedSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (!generatedSql) return
    onInsertSql(generatedSql)
    onClose()
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitleGroup>
            <HeaderTitle>
              <Sparkles size={16} color="#c084fc" />
              <span>Assistente de IA Local (Ollama)</span>
            </HeaderTitle>
            <AiStatusBadge status={status} isLoading={isStatusLoading} onRefresh={() => refetchStatus()} />
          </HeaderTitleGroup>
          <CloseButton onClick={onClose} title="Fechar (Esc)">
            <X size={15} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <ModeTabBar>
            <ModeTabButton
              type="button"
              $active={mode === AiMode.Query}
              onClick={() => {
                setMode(AiMode.Query)
                setGeneratedSql(null)
              }}
            >
              <div className="title">
                <FileCode size={13} />
                <span>Consulta Analítica</span>
              </div>
              <div className="subtitle">JOINs, agregações, filtros e métricas complexas</div>
            </ModeTabButton>

            <ModeTabButton
              type="button"
              $active={mode === AiMode.Modeling}
              onClick={() => {
                setMode(AiMode.Modeling)
                setGeneratedSql(null)
              }}
            >
              <div className="title">
                <Database size={13} />
                <span>Modelagem de Banco (DDL)</span>
              </div>
              <div className="subtitle">Novas tabelas, relacionamentos, constraints e índices</div>
            </ModeTabButton>
          </ModeTabBar>

          <ControlRow>
            <ModelSelectGroup>
              <span>Modelo Local:</span>
              <Select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </ModelSelectGroup>

            <SafetyBadge>
              <ShieldAlert size={12} color="var(--brand)" />
              <span>Modo Consultivo • Sem permissão de execução direta</span>
            </SafetyBadge>
          </ControlRow>

          {!status?.isOnline && (
            <OfflineNotice>
              <strong>Ollama não detectado localmente em 127.0.0.1:11434</strong>
              <div>
                Para utilizar o assistente com privacidade total, inicie o Ollama no seu terminal executando:{' '}
                <code>ollama run qwen2.5-coder:7b</code> ou <code>ollama serve</code>.
              </div>
            </OfflineNotice>
          )}

          <div>
            <PromptTextarea
              placeholder={activeModeConfig.placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
          </div>

          <ExamplesRow>
            <ExamplesLabel>Sugestões Rápidas:</ExamplesLabel>
            <ChipsWrap>
              {activeModeConfig.examples.map((ex, i) => (
                <Chip key={i} type="button" onClick={() => setPrompt(ex)}>
                  {ex}
                </Chip>
              ))}
            </ChipsWrap>
          </ExamplesRow>

          {errorMessage && (
            <div style={{ color: 'var(--danger)', fontSize: 11, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
              {errorMessage}
            </div>
          )}

          {generatedSql && (
            <ResultContainer>
              <ResultHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Terminal size={13} />
                  <span>Código SQL Proposto (Revisão Humana)</span>
                </div>
                <OutlineButton type="button" onClick={handleCopy}>
                  {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </OutlineButton>
              </ResultHeader>

              <SqlPreview>{generatedSql}</SqlPreview>

              {explanation && (
                <ExplanationBox>
                  <strong>Explicação do Assistente:</strong>
                  <div style={{ marginTop: 4 }}>{explanation}</div>
                </ExplanationBox>
              )}
            </ResultContainer>
          )}
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <OutlineButton type="button" onClick={onClose}>
              Cancelar
            </OutlineButton>
          </ButtonGroup>

          <ButtonGroup>
            {generatedSql && onOpenInNewTab && (
              <OutlineButton
                type="button"
                onClick={() => {
                  onOpenInNewTab(generatedSql)
                  onClose()
                }}
              >
                <span>Abrir em Nova Aba</span>
              </OutlineButton>
            )}

            {generatedSql && (
              <InsertButton type="button" onClick={handleInsert}>
                <FileCode size={13} />
                <span>Inserir no Editor</span>
              </InsertButton>
            )}

            <PrimaryButton
              type="button"
              $loading={isGenerating}
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="spinner" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>{mode === AiMode.Query ? 'Gerar Consulta' : 'Gerar Modelagem DDL'}</span>
                </>
              )}
            </PrimaryButton>
          </ButtonGroup>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  )
}
