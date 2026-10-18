import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SQLiteAdapter } from '../lib/main/sqlite-adapter.ts'

test('lê schema, executa SQL e serializa valores BLOB', () => {
  const database = new SQLiteAdapter(':memory:')

  try {
    database.execute('CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT NOT NULL, avatar BLOB)')
    database.execute("INSERT INTO people (name, avatar) VALUES ('Ada', X'0102'), ('Linus', NULL)")

    assert.deepEqual(database.getSchema(), {
      tables: [{ name: 'people', kind: 'table' }],
      columnsByTable: { people: ['id', 'name', 'avatar'] },
    })

    const result = database.execute('SELECT id, name, avatar FROM people ORDER BY id')
    assert.deepEqual(result.columns, ['id', 'name', 'avatar'])
    assert.deepEqual(result.rows, [
      [1, 'Ada', { type: 'blob', base64: 'AQI=' }],
      [2, 'Linus', null],
    ])
  } finally {
    database.close()
  }
})

test('preserva nomes de coluna duplicados em joins', () => {
  const database = new SQLiteAdapter(':memory:')

  try {
    database.execute('CREATE TABLE left_side (id INTEGER)')
    database.execute('CREATE TABLE right_side (id INTEGER)')
    const result = database.execute('SELECT left_side.id, right_side.id FROM left_side CROSS JOIN right_side LIMIT 1')

    assert.deepEqual(result.columns, ['id', 'id'])
  } finally {
    database.close()
  }
})

test('limita resultados grandes sem carregar todas as linhas', () => {
  const database = new SQLiteAdapter(':memory:')

  try {
    const result = database.execute(
      'WITH RECURSIVE numbers(value) AS (VALUES(1) UNION ALL SELECT value + 1 FROM numbers WHERE value < 1002) SELECT value FROM numbers'
    )

    assert.equal(result.rows.length, 1_000)
    assert.equal(result.truncated, true)
  } finally {
    database.close()
  }
})
