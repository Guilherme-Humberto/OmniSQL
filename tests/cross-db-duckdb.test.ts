import assert from 'node:assert/strict'
import { test } from 'node:test'
import { writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { DuckDbEngine, formatDuckDbCell } from '../lib/main/cross-db/duckdb-engine.ts'
import {
  analyzeCrossDbQuery,
  buildCrossDbSnippet,
  normalizeSourceSchemaName,
} from '../app/features/cross-db/domain/query-analyzer.ts'

test('normalizeSourceSchemaName: normaliza nomes com espaços, acentos e caracteres especiais', () => {
  assert.equal(normalizeSourceSchemaName('MySQL de Produção'), 'mysql_de_producao')
  assert.equal(normalizeSourceSchemaName('Postgres-Analytics-16'), 'postgres_analytics_16')
  assert.equal(normalizeSourceSchemaName('123_Database'), 'src_123_database')
  assert.equal(normalizeSourceSchemaName('CRM / Vendas'), 'crm_vendas')
})

test('analyzeCrossDbQuery: identifica tabelas e arquivos locais referenciados no SQL', () => {
  const sql = `
    SELECT o.id, o.total, u.nome, c.categoria
    FROM mysql_prod.orders o
    JOIN "pg_crm"."clientes" u ON o.cliente_id = u.id
    JOIN read_csv_auto('/tmp/categorias.csv') c ON o.cat_id = c.id
    WHERE o.total > 100;
  `

  const availableSources = [
    { schemaName: 'mysql_prod', tables: ['orders', 'items'] },
    { schemaName: 'pg_crm', tables: ['clientes', 'enderecos'] },
    { schemaName: 'sqlite_local', tables: ['logs'] },
  ]

  const analyzed = analyzeCrossDbQuery(sql, availableSources)

  // Tabelas identificadas
  assert.equal(analyzed.tables.length, 2)
  assert.equal(analyzed.tables[0]?.sourceName, 'mysql_prod')
  assert.equal(analyzed.tables[0]?.tableName, 'orders')
  assert.equal(analyzed.tables[1]?.sourceName, 'pg_crm')
  assert.equal(analyzed.tables[1]?.tableName, 'clientes')

  // Arquivos identificados
  assert.equal(analyzed.files.length, 1)
  assert.equal(analyzed.files[0]?.filePath, '/tmp/categorias.csv')
  assert.equal(analyzed.files[0]?.extension, 'csv')
})

test('buildCrossDbSnippet: gera modelos de consultas cross-database e arquivos locais', () => {
  const snippetJoin = buildCrossDbSnippet(
    { schemaName: 'mysql_prod', tableName: 'orders' },
    { schemaName: 'pg_crm', tableName: 'users' }
  )
  assert.ok(snippetJoin.includes('FROM mysql_prod.orders a'))
  assert.ok(snippetJoin.includes('JOIN pg_crm.users b'))

  const snippetCsv = buildCrossDbSnippet(
    { schemaName: 'mysql_prod', tableName: 'pedidos' },
    undefined,
    '/tmp/metas.csv'
  )
  assert.ok(snippetCsv.includes('FROM mysql_prod.pedidos db'))
  assert.ok(snippetCsv.includes("read_csv_auto('/tmp/metas.csv')"))
})

test('formatDuckDbCell: serializa BigInt, Data, Boolean, Buffer e Null com segurança', () => {
  assert.equal(formatDuckDbCell(100n), 100)
  assert.equal(formatDuckDbCell(true), 1)
  assert.equal(formatDuckDbCell(false), 0)
  assert.equal(formatDuckDbCell(null), null)
  assert.equal(formatDuckDbCell(undefined), null)
  assert.equal(formatDuckDbCell(45.5), 45.5)

  const date = new Date('2026-10-23T00:00:00.000Z')
  assert.equal(formatDuckDbCell(date), '2026-10-23T00:00:00.000Z')

  const buffer = Buffer.from('teste')
  assert.deepEqual(formatDuckDbCell(buffer), { type: 'blob', base64: 'dGVzdGU=' })
})

test('DuckDbEngine: executa JOIN entre tabelas sincronizadas de bancos distintos e arquivo CSV local', async () => {
  const engine = new DuckDbEngine()
  const csvPath = join(tmpdir(), `test_categories_${Date.now()}.csv`)

  try {
    // 1. Cria arquivo CSV temporário local
    writeFileSync(csvPath, 'id,category_name,tax_rate\n1,Eletrônicos,0.15\n2,Móveis,0.10\n')

    // 2. Simula sincronização de tabela do MySQL (pedidos)
    await engine.syncTable({
      schemaName: 'mysql_prod',
      tableName: 'pedidos',
      columns: ['id', 'user_id', 'category_id', 'total'],
      rows: [
        [101, 1, 1, 2500.0],
        [102, 2, 2, 800.0],
        [103, 1, 2, 450.0],
      ],
    })

    // 3. Simula sincronização de tabela do PostgreSQL (clientes)
    await engine.syncTable({
      schemaName: 'pg_crm',
      tableName: 'clientes',
      columns: ['id', 'nome', 'cidade'],
      rows: [
        [1, 'Ada Lovelace', 'Londres'],
        [2, 'Alan Turing', 'Manchester'],
      ],
    })

    // 4. Executa query mágica Cross-Database: MySQL + PostgreSQL + CSV Local!
    const query = `
      SELECT
        p.id AS pedido_id,
        c.nome AS cliente,
        c.cidade,
        cat.category_name AS categoria,
        p.total,
        ROUND(p.total * (1 + cat.tax_rate), 2) AS total_com_imposto
      FROM mysql_prod.pedidos p
      JOIN pg_crm.clientes c ON p.user_id = c.id
      JOIN read_csv_auto('${csvPath}') cat ON p.category_id = cat.id
      ORDER BY p.id;
    `

    const result = await engine.execute(query)

    assert.equal(result.columns.length, 6)
    assert.deepEqual(result.columns, [
      'pedido_id',
      'cliente',
      'cidade',
      'categoria',
      'total',
      'total_com_imposto',
    ])

    assert.equal(result.rows.length, 3)

    // Pedido 101: Ada Lovelace, Eletrônicos (tax 0.15) -> 2500 * 1.15 = 2875.0
    assert.equal(result.rows[0]![0], 101)
    assert.equal(result.rows[0]![1], 'Ada Lovelace')
    assert.equal(result.rows[0]![2], 'Londres')
    assert.equal(result.rows[0]![3], 'Eletrônicos')
    assert.equal(result.rows[0]![4], 2500.0)
    assert.equal(result.rows[0]![5], 2875.0)

    // Pedido 102: Alan Turing, Móveis (tax 0.10) -> 800 * 1.10 = 880.0
    assert.equal(result.rows[1]![0], 102)
    assert.equal(result.rows[1]![1], 'Alan Turing')
    assert.equal(result.rows[1]![2], 'Manchester')
    assert.equal(result.rows[1]![3], 'Móveis')
    assert.equal(result.rows[1]![4], 800.0)
    assert.equal(result.rows[1]![5], 880.0)

    // Também verifica que a view simplificada `mysql_prod_pedidos` funciona
    const viewResult = await engine.execute('SELECT COUNT(*) as qtd FROM mysql_prod_pedidos;')
    assert.equal(viewResult.rows[0]![0], 3)
  } finally {
    await engine.close()
    try {
      unlinkSync(csvPath)
    } catch {
      // Ignora erro se já removido
    }
  }
})

