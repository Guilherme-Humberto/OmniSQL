import type { DocumentationOptions, TableDocumentationMeta } from './types'

const EntityKind = {
  Table: 'table',
  View: 'view',
} as const

/**
 * Gera um Dicionário de Dados completo, estruturado e visualmente agradável em Markdown puro,
 * 100% compatível com Notion, GitHub, GitLab, Obsidian e ferramentas modernas de documentação.
 */
export function generateMarkdownDictionary(options: DocumentationOptions): string {
  const { databaseName, driver, tables, includeViews = true, generatedAt } = options

  const filteredTables = tables.filter((t) => includeViews || t.kind === EntityKind.Table)
  const dateStr = generatedAt || new Date().toLocaleDateString('pt-BR')

  const lines: string[] = [
    `# 📖 Dicionário de Dados: \`${databaseName}\``,
    `> **Banco de Dados**: \`${databaseName}\` | **Driver**: \`${driver.toUpperCase()}\` | **Data**: ${dateStr}`,
    '',
    `Este documento contém o catálogo estrutural completo de entidades, colunas, tipos de dados, chaves primárias e relacionamentos gerado automaticamente pelo **SQL Editor**.`,
    '',
    '---',
    '',
    '## 📑 Sumário das Entidades',
    '',
    '| Entidade | Tipo | Colunas | Chaves Estrangeiras |',
    '| :--- | :---: | :---: | :---: |',
  ]

  for (const table of filteredTables) {
    const anchor = `#${table.name.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`
    const kindBadge = table.kind === EntityKind.View ? '`VIEW`' : '`TABELA`'
    const fkCount = table.foreignKeys.length
    lines.push(
      `| [**\`${table.name}\`**](${anchor}) | ${kindBadge} | ${table.columns.length} | ${fkCount > 0 ? `${fkCount} FKs` : '-'} |`
    )
  }

  lines.push('', '---', '', '## 🗄️ Detalhamento das Tabelas e Atributos', '')

  for (const table of filteredTables) {
    lines.push(...renderTableSection(table))
  }

  return lines.join('\n')
}

function renderTableSection(table: TableDocumentationMeta): string[] {
  const lines: string[] = [
    `### \`${table.name}\``,
    table.comment ? `> ${table.comment}\n` : `*Tipo: \`${table.kind.toUpperCase()}\`*\n`,
    '| Coluna | Tipo | PK | FK | Não Nulo | Descrição / Relacionamento |',
    '| :--- | :--- | :---: | :---: | :---: | :--- |',
  ]

  for (const col of table.columns) {
    const isPk = col.primaryKey ? '✅' : ''
    const fk = table.foreignKeys.find((f) => f.from === col.name)
    const isFk = fk ? '🔗' : ''
    const isNotNull = col.notNull ? '✅' : ''

    let desc = ''
    if (fk) {
      const targetAnchor = `#${fk.table.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`
      desc = `Aponta para [\`${fk.table}(${fk.to})\`](${targetAnchor})`
    }

    lines.push(
      `| \`${col.name}\` | \`${col.type || 'TEXT'}\` | ${isPk} | ${isFk} | ${isNotNull} | ${desc} |`
    )
  }

  if (table.foreignKeys.length > 0) {
    lines.push('', '#### 🔗 Relacionamentos Externos (Foreign Keys)', '')
    for (const fk of table.foreignKeys) {
      const targetAnchor = `#${fk.table.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`
      lines.push(`- **\`${table.name}.${fk.from}\`** ➔ [\`${fk.table}.${fk.to}\`](${targetAnchor})`)
    }
  }

  lines.push('', '---', '')
  return lines
}

