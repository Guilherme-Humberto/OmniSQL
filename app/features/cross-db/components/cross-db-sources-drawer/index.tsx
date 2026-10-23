import { Database, FileSpreadsheet, Plus, Sparkles, Table2, X } from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import {
  DrawerOverlay,
  DrawerContainer,
  DrawerHeader,
  HeaderTitleGroup,
  DrawerTitle,
  DuckDbBadge,
  CloseButton,
  DrawerBody,
  InfoBanner,
  ActionCard,
  SectionTitle,
  AttachFileButton,
  SourcesList,
  SourceCard,
  SourceHeader,
  SourceTitleGroup,
  SchemaCode,
  TableItem,
  InsertSnippetButton,
  ExampleList,
  ExampleButton,
} from './styles'

interface CrossDbSourcesDrawerProps {
  isOpen: boolean
  onClose: () => void
  onInsertSnippet: (snippet: string) => void
}

/**
 * Drawer lateral para visualização de fontes federadas e arquivos locais suportados pelo DuckDB.
 */
export function CrossDbSourcesDrawer({
  isOpen,
  onClose,
  onInsertSnippet,
}: CrossDbSourcesDrawerProps) {
  const { data: catalog } = conveyor.crossDb.catalog.useQuery({
    enabled: isOpen,
  })

  const handleAttachFile = async () => {
    try {
      const file = await conveyor.crossDb.selectFile()
      if (!file.filePath) return

      let snippet = ''
      if (file.fileType === 'parquet') {
        snippet = `read_parquet('${file.filePath}')`
      } else if (file.fileType === 'json') {
        snippet = `read_json_auto('${file.filePath}')`
      } else {
        snippet = `read_csv_auto('${file.filePath}')`
      }

      onInsertSnippet(`-- Fonte local anexada (${file.fileName})\nSELECT *\nFROM ${snippet}\nLIMIT 50;`)
      onClose()
    } catch (err) {
      console.error('Erro ao anexar arquivo:', err)
    }
  }

  if (!isOpen) return null

  return (
    <DrawerOverlay onClick={onClose}>
      <DrawerContainer onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Catálogo Cross-Database">
        <DrawerHeader>
          <HeaderTitleGroup>
            <Sparkles size={18} color="#eab308" />
            <DrawerTitle>Cross-Database ETL</DrawerTitle>
            <DuckDbBadge>DuckDB</DuckDbBadge>
          </HeaderTitleGroup>
          <CloseButton type="button" onClick={onClose} title="Fechar painel">
            <X size={16} />
          </CloseButton>
        </DrawerHeader>

        <DrawerBody>
          <InfoBanner>
            O motor <strong>DuckDB</strong> permite cruzar tabelas de bancos distintos (MySQL, PostgreSQL, SQLite)
            e arquivos locais (CSV, Parquet, JSON) em uma única consulta SQL vetorial ultrarrápida.
          </InfoBanner>

          {/* Anexar Arquivos Locais */}
          <ActionCard>
            <SectionTitle>
              <FileSpreadsheet size={14} />
              Arquivos Locais (CSV / Parquet / JSON)
            </SectionTitle>
            <AttachFileButton type="button" onClick={handleAttachFile}>
              <Plus size={14} />
              <span>Anexar Arquivo Local (.csv, .parquet, .json)</span>
            </AttachFileButton>
          </ActionCard>

          {/* Catálogo de Fontes e Schemas de Conexão */}
          <ActionCard>
            <SectionTitle>
              <Database size={14} />
              Bancos e Schemas Federados
            </SectionTitle>

            <SourcesList>
              {catalog?.sources.map((source) => (
                <SourceCard key={source.id}>
                  <SourceHeader>
                    <SourceTitleGroup>
                      <Database size={12} />
                      <span>{source.name}</span>
                    </SourceTitleGroup>
                    <SchemaCode>{source.driver.toUpperCase()}</SchemaCode>
                  </SourceHeader>

                  {source.tables.length > 0 ? (
                    source.tables.map((table) => (
                      <TableItem key={table}>
                        <span>{table}</span>
                        <InsertSnippetButton
                          type="button"
                          onClick={() => {
                            onInsertSnippet(`${source.name}.${table}`)
                            onClose()
                          }}
                          title={`Inserir ${source.name}.${table} na query`}
                        >
                          + Inserir
                        </InsertSnippetButton>
                      </TableItem>
                    ))
                  ) : (
                    <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--foreground-muted)' }}>
                      Conecte ou abra o banco para inspecionar tabelas.
                    </div>
                  )}
                </SourceCard>
              ))}

              {!catalog?.sources.length && (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--foreground-muted)', fontSize: '12px' }}>
                  Nenhuma conexão cadastrada no gerenciador.
                </div>
              )}
            </SourcesList>
          </ActionCard>

          {/* Exemplos Prontos de Queries Cross-Database */}
          <ActionCard>
            <SectionTitle>
              <Table2 size={14} />
              Modelos de Queries Federadas
            </SectionTitle>
            <ExampleList>
              <ExampleButton
                type="button"
                onClick={() => {
                  onInsertSnippet(`-- JOIN entre MySQL de Produção e PostgreSQL Analytics
SELECT
  m.id AS order_id,
  m.total,
  p.nome AS cliente,
  p.email
FROM mysql_prod.orders m
JOIN postgres_crm.clientes p
  ON m.cliente_id = p.id
LIMIT 50;`)
                  onClose()
                }}
              >
                <strong>JOIN MySQL + PostgreSQL</strong>
                <span>Cruza pedidos do MySQL com clientes do PostgreSQL</span>
              </ExampleButton>

              <ExampleButton
                type="button"
                onClick={() => {
                  onInsertSnippet(`-- Cruzamento de Banco Remoto com Planilha CSV Local
SELECT
  db.id,
  db.nome,
  planilha.meta_vendas,
  planilha.comissao
FROM postgres_crm.vendedores db
JOIN read_csv_auto('caminho/para/metas.csv') planilha
  ON db.codigo = planilha.codigo_vendedor
ORDER BY db.nome;`)
                  onClose()
                }}
              >
                <strong>JOIN Banco + Arquivo CSV</strong>
                <span>Cruza dados do banco com uma planilha local</span>
              </ExampleButton>
            </ExampleList>
          </ActionCard>
        </DrawerBody>
      </DrawerContainer>
    </DrawerOverlay>
  )
}
