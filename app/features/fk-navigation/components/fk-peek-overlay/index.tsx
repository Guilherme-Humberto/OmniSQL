import { useEffect, useState } from 'react'
import { Check, Copy, ExternalLink, KeyRound, Loader2, Table2, X } from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import {
  OverlayBackdrop,
  PeekCard,
  PeekHeader,
  HeaderTitleGroup,
  TableBadge,
  IdPill,
  CloseButton,
  PeekBody,
  FieldRow,
  FieldKey,
  FieldVal,
  PeekFooter,
  ActionGroup,
  ActionButton,
  HintText,
  LoadingContainer,
  ErrorNotice,
} from './styles'

interface FkPeekOverlayProps {
  connectionId: string
  targetTable: string
  targetColumn: string
  value: string | number
  onClose: () => void
  onOpenInNewTab: (sql: string) => void
}

export function FkPeekOverlay({
  connectionId,
  targetTable,
  targetColumn,
  value,
  onClose,
  onOpenInNewTab,
}: FkPeekOverlayProps) {
  const [copied, setCopied] = useState(false)

  // Executa a busca pontual indexada pelo worker thread no processo Main
  const { data, isLoading, error } = conveyor.database.peekRecord.useQuery({
    input: {
      connectionId,
      targetTable,
      targetColumn,
      value,
    },
  })

  // Fecha com tecla Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleCopyJson = async () => {
    if (!data?.record) return
    await navigator.clipboard.writeText(JSON.stringify(data.record, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenNewTab = () => {
    const formattedVal = typeof value === 'number' ? value : `'${String(value).replaceAll("'", "''")}'`
    const sql = `SELECT *\nFROM "${targetTable.replaceAll('"', '""')}"\nWHERE "${targetColumn.replaceAll('"', '""')}" = ${formattedVal}\nLIMIT 1;`
    onOpenInNewTab(sql)
    onClose()
  }

  return (
    <OverlayBackdrop onClick={onClose}>
      <PeekCard onClick={(e) => e.stopPropagation()}>
        <PeekHeader>
          <HeaderTitleGroup>
            <TableBadge>
              <Table2 size={14} />
              <span>{targetTable}</span>
            </TableBadge>
            <IdPill>
              {targetColumn} = {String(value)}
            </IdPill>
          </HeaderTitleGroup>
          <CloseButton onClick={onClose} title="Fechar (Esc)">
            <X size={15} />
          </CloseButton>
        </PeekHeader>

        <PeekBody>
          {isLoading && (
            <LoadingContainer>
              <Loader2 size={18} className="animate-spin" />
              <span>Buscando registro referenciado...</span>
            </LoadingContainer>
          )}

          {error && (
            <ErrorNotice>
              <strong>Falha ao carregar registro:</strong>
              <div>{error.message}</div>
            </ErrorNotice>
          )}

          {data && !data.found && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--foreground-muted)', fontSize: 12 }}>
              Nenhum registro encontrado em <strong>{targetTable}</strong> com <strong>{targetColumn} = {String(value)}</strong>.
            </div>
          )}

          {data?.record &&
            Object.entries(data.record).map(([colName, colVal]) => {
              const isPk = colName.toLowerCase() === targetColumn.toLowerCase()
              return (
                <FieldRow key={colName} $isPk={isPk}>
                  <FieldKey>
                    {isPk && <KeyRound size={11} color="var(--brand)" />}
                    <span>{colName}</span>
                  </FieldKey>
                  <FieldVal>
                    {colVal === null ? (
                      <span className="null-indicator">NULL</span>
                    ) : typeof colVal === 'object' && 'type' in colVal && colVal.type === 'blob' ? (
                      <span style={{ color: 'var(--foreground-muted)' }}>[BLOB {colVal.base64.length} chars]</span>
                    ) : (
                      String(colVal)
                    )}
                  </FieldVal>
                </FieldRow>
              )
            })}
        </PeekBody>

        <PeekFooter>
          <HintText>Dica: Pressione Esc para fechar</HintText>
          <ActionGroup>
            {data?.found && (
              <>
                <ActionButton type="button" onClick={handleCopyJson}>
                  {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
                </ActionButton>
                <ActionButton type="button" onClick={handleOpenNewTab}>
                  <ExternalLink size={12} />
                  <span>Abrir em Nova Aba</span>
                </ActionButton>
              </>
            )}
          </ActionGroup>
        </PeekFooter>
      </PeekCard>
    </OverlayBackdrop>
  )
}
