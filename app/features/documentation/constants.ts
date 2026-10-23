export const DocumentationTab = {
  Dictionary: 'dictionary',
  Mermaid: 'mermaid',
  AiDoc: 'ai_doc',
  SqlComments: 'sql_comments',
} as const

export type DocumentationTab = (typeof DocumentationTab)[keyof typeof DocumentationTab]
export type DocumentationTabId = DocumentationTab

export interface DocumentationTabMeta {
  id: DocumentationTab
  label: string
  badge?: string
}

export const DOCUMENTATION_TABS: DocumentationTabMeta[] = [
  { id: DocumentationTab.Dictionary, label: 'Dicionário de Dados', badge: 'Markdown / Notion' },
  { id: DocumentationTab.Mermaid, label: 'Diagrama ER', badge: 'Mermaid.js' },
  { id: DocumentationTab.AiDoc, label: 'Auto-Documentador IA', badge: 'Ollama Offline' },
]
