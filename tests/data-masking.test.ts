import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detectSensitiveKind, matchesColumnTag } from '../app/features/data-masking/domain/heuristic-detector.ts'
import {
  maskEmail,
  maskCpfCnpj,
  maskPhone,
  maskName,
  maskCreditCard,
  maskCell,
  transformRowsWithMasking,
  hashString,
} from '../app/features/data-masking/domain/masking-engine.ts'
import {
  serializeToCsv,
  serializeToJson,
  serializeToSqlInserts,
} from '../app/features/data-masking/domain/export-serializers.ts'
import type { DatabaseCell } from '../conveyor/database-contracts.ts'
import type { ColumnMaskConfig, SensitiveTagsConfig } from '../app/features/data-masking/domain/masking-types.ts'
import { DEFAULT_SENSITIVE_TAGS } from '../app/features/data-masking/domain/heuristic-detector.ts'

test('matchesColumnTag: identifica correspondência de tags isoladas ou delimitadas', () => {
  assert.equal(matchesColumnTag('cpf', 'cpf'), true)
  assert.equal(matchesColumnTag('nr_cpf_cliente', 'cpf'), true)
  assert.equal(matchesColumnTag('userEmail', 'email'), true)
  assert.equal(matchesColumnTag('ds-telefone', 'telefone'), true)

  // Falsos positivos comuns evitados
  assert.equal(matchesColumnTag('snapshot', 'shot'), true)
  assert.equal(matchesColumnTag('notificacao', 'cat'), false)
})

test('detectSensitiveKind: aceita dicionário customizado de tags por banco de dados', () => {
  const customBankTags: SensitiveTagsConfig = {
    ...DEFAULT_SENSITIVE_TAGS,
    // Adicionamos tag proprietária do banco do cliente: 'chave_pix' e 'tax_id'
    generic: [...DEFAULT_SENSITIVE_TAGS.generic, 'chave_pix'],
    cpf_cnpj: [...DEFAULT_SENSITIVE_TAGS.cpf_cnpj, 'tax_id'],
    // Removemos 'nome' das tags para que não seja mascarado nesse banco específico
    name: [],
  }

  // Verifica tag customizada adicionada
  assert.equal(detectSensitiveKind('ds_chave_pix', undefined, customBankTags), 'generic')
  assert.equal(detectSensitiveKind('company_tax_id', undefined, customBankTags), 'cpf_cnpj')

  // Verifica que 'nome_completo' não é mais classificado como sensível nesse banco
  assert.equal(detectSensitiveKind('nome_completo', undefined, customBankTags), 'none')
})

test('detectSensitiveKind: detecta tipos sensíveis por convenção de nomenclatura padrão', () => {
  assert.equal(detectSensitiveKind('email'), 'email')
  assert.equal(detectSensitiveKind('ds_email_usuario'), 'email')
  assert.equal(detectSensitiveKind('nr_cpf'), 'cpf_cnpj')
  assert.equal(detectSensitiveKind('cnpj_empresa'), 'cpf_cnpj')
  assert.equal(detectSensitiveKind('telefone_celular'), 'phone')
  assert.equal(detectSensitiveKind('senha_hash'), 'password')
  assert.equal(detectSensitiveKind('nome_completo'), 'name')
  assert.equal(detectSensitiveKind('numero_cartao'), 'credit_card')
  assert.equal(detectSensitiveKind('endereco_entrega'), 'address')
  assert.equal(detectSensitiveKind('cep'), 'address')
  assert.equal(detectSensitiveKind('rg'), 'generic')

  // Não sensíveis
  assert.equal(detectSensitiveKind('id'), 'none')
  assert.equal(detectSensitiveKind('status'), 'none')
  assert.equal(detectSensitiveKind('created_at'), 'none')
  assert.equal(detectSensitiveKind('preco_unitario'), 'none')
})

test('detectSensitiveKind: detecta tipos sensíveis por amostra de valores', () => {
  assert.equal(detectSensitiveKind('campo_x', ['contato@empresa.com.br']), 'email')
  assert.equal(detectSensitiveKind('campo_y', ['123.456.789-00']), 'cpf_cnpj')
  assert.equal(detectSensitiveKind('campo_z', ['(11) 98765-4321']), 'phone')
  assert.equal(detectSensitiveKind('campo_w', ['100', '200']), 'none')
})

test('maskEmail: mascara usuário preservando primeiro/último caractere e domínio', () => {
  assert.equal(maskEmail('guilherme@dominio.com'), 'g*******e@dominio.com')
  assert.equal(maskEmail('ab@dominio.com'), 'a*@dominio.com')
  assert.equal(maskEmail('invalido'), 'i******o')
})

test('maskCpfCnpj: mascara documentos preservando pontuações e dígitos seguros', () => {
  assert.equal(maskCpfCnpj('123.456.789-01'), '123.***.***-01')
  assert.equal(maskCpfCnpj('12.345.678/0001-90'), '12.***.***/****-90')
})

test('maskPhone: mascara números de telefone', () => {
  assert.equal(maskPhone('(11) 98765-4321'), '(11) 9****-4321')
})

test('maskName: mascara sobrenomes mantendo iniciais', () => {
  assert.equal(maskName('Alan Mathison Turing'), 'A*** M******* T*****')
})

test('maskCreditCard: oculta dígitos iniciais exibindo apenas os 4 finais', () => {
  assert.equal(maskCreditCard('4111 2222 3333 4444'), '**** **** **** 4444')
})

test('maskCell: aplica regras individualmente em células', () => {
  assert.equal(maskCell('segredo123', 'mask', 'password', 0), '********')
  assert.equal(maskCell('segredo123', 'null', 'password', 0), null)
  assert.equal(maskCell(null, 'mask', 'email', 0), null)
  assert.equal(maskCell('original', 'none', 'name', 0), 'original')
})

test('maskCell e transformRowsWithMasking: aplicam regras configuradas com precisão', () => {
  const columns = ['id', 'nome', 'email', 'cpf', 'salario']
  const rows: DatabaseCell[][] = [
    [1, 'Ada Lovelace', 'ada@computing.org', '111.222.333-44', 15000],
    [2, 'Charles Babbage', 'charles@computing.org', '555.666.777-88', 14000],
  ]

  const configs: Record<string, ColumnMaskConfig> = {
    id: { columnName: 'id', sensitiveKind: 'none', rule: 'none' },
    nome: { columnName: 'nome', sensitiveKind: 'name', rule: 'mask' },
    email: { columnName: 'email', sensitiveKind: 'email', rule: 'fake' },
    cpf: { columnName: 'cpf', sensitiveKind: 'cpf_cnpj', rule: 'hash' },
    salario: { columnName: 'salario', sensitiveKind: 'generic', rule: 'null' },
  }

  const transformed = transformRowsWithMasking(columns, rows, configs)

  // Linha 1
  assert.equal(transformed[0]![0], 1)
  assert.equal(transformed[0]![1], 'A** L*******')
  assert.equal(transformed[0]![2], 'usuario_anon_1@exemplo.local')
  assert.equal(transformed[0]![3], hashString('111.222.333-44'))
  assert.equal(transformed[0]![4], null)

  // Linha 2
  assert.equal(transformed[1]![0], 2)
  assert.equal(transformed[1]![1], 'C****** B******')
  assert.equal(transformed[1]![2], 'usuario_anon_2@exemplo.local')
  assert.equal(transformed[1]![3], hashString('555.666.777-88'))
  assert.equal(transformed[1]![4], null)
})

test('serializeToCsv: gera CSV com delimitador e escape de caracteres especiais', () => {
  const columns = ['id', 'nome', 'observacao']
  const rows: DatabaseCell[][] = [
    [1, 'Nome "Com Aspas"', 'Linha com, vírgula'],
    [2, 'Simples', null],
  ]

  const csv = serializeToCsv(columns, rows, { delimiter: ',' })
  const lines = csv.split('\n')

  assert.equal(lines[0], 'id,nome,observacao')
  assert.equal(lines[1], '1,"Nome ""Com Aspas""","Linha com, vírgula"')
  assert.equal(lines[2], '2,Simples,')
})

test('serializeToJson: gera estrutura serializada preservando nulos e números', () => {
  const columns = ['id', 'ativo', 'email']
  const rows: DatabaseCell[][] = [[10, 1, 'anon@local.dev']]

  const jsonString = serializeToJson(columns, rows, false)
  const parsed = JSON.parse(jsonString)

  assert.deepEqual(parsed, [{ id: 10, ativo: 1, email: 'anon@local.dev' }])
})

test('serializeToSqlInserts: gera comandos INSERT com escape de aspas simples', () => {
  const columns = ['id', 'autor', 'preco']
  const rows: DatabaseCell[][] = [
    [1, "D'Artagnan", 49.9],
    [2, 'Machado de Assis', null],
  ]

  const sql = serializeToSqlInserts(columns, rows, { tableName: 'livros' })
  assert.match(sql, /INSERT INTO "livros" \("id", "autor", "preco"\) VALUES \(1, 'D''Artagnan', 49.9\);/)
  assert.match(sql, /INSERT INTO "livros" \("id", "autor", "preco"\) VALUES \(2, 'Machado de Assis', NULL\);/)
})

test('anonimização flexível controlada pelo usuário em qualquer campo arbitrário', () => {
  const columns = ['codigo_filial', 'descricao_interna', 'valor_orcamento', 'contato_secundario', 'status_pedido']
  const rows: DatabaseCell[][] = [
    ['FIL-101', 'Projeto Sigiloso Alpha', 50000, '(11) 98888-7777', 'APROVADO'],
    ['FIL-102', 'Auditoria Beta', 75000, '(21) 99999-0000', 'PENDENTE'],
  ]

  // Usuário marca campos específicos para anonimização com regras distintas:
  // - 'descricao_interna' -> redact_fixed ([ANONIMIZADO])
  // - 'valor_orcamento' -> fake_number
  // - 'codigo_filial' -> hash
  // - 'contato_secundario' -> fake_phone
  // - 'status_pedido' -> NÃO MARCADO (enabled: false)
  const configs: Record<string, ColumnMaskConfig> = {
    codigo_filial: { columnName: 'codigo_filial', enabled: true, rule: 'hash' },
    descricao_interna: { columnName: 'descricao_interna', enabled: true, rule: 'redact' },
    valor_orcamento: { columnName: 'valor_orcamento', enabled: true, rule: 'fake_number' },
    contato_secundario: { columnName: 'contato_secundario', enabled: true, rule: 'fake_phone' },
    status_pedido: { columnName: 'status_pedido', enabled: false, rule: 'none' },
  }

  const result = transformRowsWithMasking(columns, rows, configs)

  // Linha 1
  assert.equal(result[0]![0], hashString('FIL-101'))
  assert.equal(result[0]![1], '[ANONIMIZADO]')
  assert.equal(result[0]![2], 1001)
  assert.equal(result[0]![3], '(11) 99000-0001')
  assert.equal(result[0]![4], 'APROVADO') // Mantido 100% original

  // Linha 2
  assert.equal(result[1]![0], hashString('FIL-102'))
  assert.equal(result[1]![1], '[ANONIMIZADO]')
  assert.equal(result[1]![2], 1002)
  assert.equal(result[1]![3], '(11) 99000-0002')
  assert.equal(result[1]![4], 'PENDENTE') // Mantido 100% original
})
