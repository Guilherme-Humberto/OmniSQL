import type { AiMode } from '@/conveyor/ai-contracts'

export const DEFAULT_AI_MODELS = [
  'qwen2.5-coder:7b',
  'qwen2.5-coder:1.5b',
  'deepseek-coder:6.7b',
  'sqlcoder:7b',
  'llama3.1:8b',
  'codellama:7b',
]

export const OLLAMA_LOCAL_URL = 'http://127.0.0.1:11434'

export interface AiModeOption {
  id: AiMode
  title: string
  subtitle: string
  placeholder: string
  examples: string[]
}

export const AI_MODES: Record<AiMode, AiModeOption> = {
  query: {
    id: 'query',
    title: 'Consulta Analítica',
    subtitle: 'Gera consultas complexas (JOINs, CTEs, Window Functions, Agregações)',
    placeholder: 'Ex: Mostre os 5 clientes com maior valor total de compras no último mês...',
    examples: [
      'Top 5 clientes com maior valor total em pedidos',
      'Calcular o ticket médio e quantidade de pedidos por mês',
      'Listar produtos que nunca tiveram nenhuma venda registrada',
      'Encontrar usuários duplicados por email mantendo o cadastro mais recente',
    ],
  },
  modeling: {
    id: 'modeling',
    title: 'Modelagem de Banco (DDL)',
    subtitle: 'Gera estruturas de tabelas, chaves estrangeiras, índices e constraints',
    placeholder: 'Ex: Crie uma estrutura para sistema de cupons com desconto percentual e validade...',
    examples: [
      'Criar tabela de cupons com desconto percentual, validade e limite de uso',
      'Modelar sistema de avaliações de produtos (1 a 5 estrelas) com comentário',
      'Criar tabela de logs de auditoria registrando user_id, ação e IP',
      'Modelar categorias hierárquicas (parent_id auto-referenciado) com índices',
    ],
  },
}

