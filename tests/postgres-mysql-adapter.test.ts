import test from 'node:test'
import assert from 'node:assert/strict'
import { toPgDatabaseCell } from '../lib/main/postgres-adapter.ts'
import { toMySqlDatabaseCell } from '../lib/main/mysql-adapter.ts'

test('Postgres: serializa tipos primitivos e especiais corretamente', () => {
  assert.equal(toPgDatabaseCell(null), null)
  assert.equal(toPgDatabaseCell('texto'), 'texto')
  assert.equal(toPgDatabaseCell(42), 42)
  assert.equal(toPgDatabaseCell(true), 1)
  assert.equal(toPgDatabaseCell(false), 0)
  assert.equal(toPgDatabaseCell(BigInt(9007199254740991)), '9007199254740991')

  const date = new Date('2026-10-23T00:00:00.000Z')
  assert.equal(toPgDatabaseCell(date), '2026-10-23T00:00:00.000Z')

  const buffer = Buffer.from([1, 2, 3])
  assert.deepEqual(toPgDatabaseCell(buffer), { type: 'blob', base64: 'AQID' })

  const json = { roles: ['admin', 'editor'] }
  assert.equal(toPgDatabaseCell(json), JSON.stringify(json))
})

test('MySQL: serializa tipos primitivos e especiais corretamente', () => {
  assert.equal(toMySqlDatabaseCell(null), null)
  assert.equal(toMySqlDatabaseCell('teste'), 'teste')
  assert.equal(toMySqlDatabaseCell(123.45), 123.45)
  assert.equal(toMySqlDatabaseCell(true), 1)
  assert.equal(toMySqlDatabaseCell(false), 0)
  assert.equal(toMySqlDatabaseCell(BigInt(100)), '100')

  const buffer = Buffer.from([0xff, 0x00])
  assert.deepEqual(toMySqlDatabaseCell(buffer), { type: 'blob', base64: '/wA=' })

  const obj = { active: true }
  assert.equal(toMySqlDatabaseCell(obj), JSON.stringify(obj))
})

