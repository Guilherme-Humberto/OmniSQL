import { ExportFormat, MaskRule, type SensitiveKind } from './domain/masking-types'
import { DEFAULT_SENSITIVE_TAGS } from './domain/heuristic-detector'

export { DEFAULT_SENSITIVE_TAGS }

export const SENSITIVE_KIND_LABELS: Record<SensitiveKind, { label: string; badge: string; color: string }> = {
  none: { label: 'Não sensível', badge: '', color: 'transparent' },
  email: { label: 'E-mail', badge: 'E-mail', color: '#38bdf8' },
  cpf_cnpj: { label: 'CPF / CNPJ', badge: 'CPF/CNPJ', color: '#f59e0b' },
  phone: { label: 'Telefone', badge: 'Telefone', color: '#34d399' },
  password: { label: 'Senha / Token', badge: 'Senha', color: '#ef4444' },
  name: { label: 'Nome Pessoal', badge: 'Nome', color: '#a78bfa' },
  credit_card: { label: 'Cartão de Crédito', badge: 'Cartão', color: '#f43f5e' },
  address: { label: 'Endereço', badge: 'Endereço', color: '#fb923c' },
  generic: { label: 'Dado Pessoal (PII)', badge: 'LGPD', color: '#fbbf24' },
}

export const MASK_RULES_OPTIONS: Array<{ value: MaskRule; label: string; description: string }> = [
  { value: MaskRule.None, label: 'Original (Sem anonimização)', description: 'Mantém o dado original' },
  { value: MaskRule.Mask, label: 'Máscara com Asteriscos (***)', description: 'Oculta caracteres com asteriscos' },
  { value: MaskRule.Redact, label: 'Texto Fixo ([ANONIMIZADO])', description: 'Substitui por texto confidencial fixo' },
  { value: MaskRule.Fake, label: 'Sintético Sequencial (campo_anon_#)', description: 'Gera valor sequencial para o campo' },
  { value: MaskRule.Null, label: 'Substituir por NULL', description: 'Zera a célula como valor nulo' },
  { value: MaskRule.Hash, label: 'Hash Criptográfico (SHA-256)', description: 'Gera hash determinístico preservando relações' },
  { value: MaskRule.FakeName, label: 'Nome Fictício', description: 'Gera Pessoa Anonimizada #' },
  { value: MaskRule.FakeEmail, label: 'E-mail Fictício', description: 'Gera usuario_anon_#@exemplo.local' },
  { value: MaskRule.FakePhone, label: 'Telefone Fictício', description: 'Gera (11) 99000-000#' },
  { value: MaskRule.FakeCpf, label: 'Documento / CPF Fictício', description: 'Gera 000.000.00#-00' },
  { value: MaskRule.FakeNumber, label: 'Número Fictício', description: 'Gera números sequenciais 100#' },
]

export const EXPORT_FORMAT_OPTIONS: Array<{ format: ExportFormat; label: string; extension: string; mime: string }> = [
  { format: ExportFormat.Csv, label: 'CSV (Planilhas)', extension: '.csv', mime: 'text/csv;charset=utf-8;' },
  { format: ExportFormat.Json, label: 'JSON (APIs / Web)', extension: '.json', mime: 'application/json;charset=utf-8;' },
  { format: ExportFormat.Sql, label: 'SQL (INSERTs)', extension: '.sql', mime: 'text/plain;charset=utf-8;' },
]

