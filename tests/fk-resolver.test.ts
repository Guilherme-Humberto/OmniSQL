import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveForeignKeyTarget } from '../app/features/fk-navigation/domain/foreign-key-resolver.ts'

test('resolve chave estrangeira exata a partir do catálogo', () => {
  const fks = {
    pedidos: [
      { id: 0, table: 'clientes', from: 'cliente_id', to: 'id' },
      { id: 1, table: 'transportadoras', from: 'transp_id', to: 'codigo' },
    ],
  }

  const result = resolveForeignKeyTarget('cliente_id', fks, ['clientes', 'pedidos'], 'pedidos')
  assert.deepEqual(result, {
    targetTable: 'clientes',
    targetColumn: 'id',
    fromColumn: 'cliente_id',
  })

  const transpResult = resolveForeignKeyTarget('transp_id', fks, ['clientes', 'pedidos'], 'pedidos')
  assert.deepEqual(transpResult, {
    targetTable: 'transportadoras',
    targetColumn: 'codigo',
    fromColumn: 'transp_id',
  })
})

test('utiliza heurística de convenção de nomes caso não haja FK declarada no catálogo', () => {
  const availableTables = ['users', 'orders', 'products']
  const result = resolveForeignKeyTarget('user_id', {}, availableTables, null)

  assert.deepEqual(result, {
    targetTable: 'users',
    targetColumn: 'id',
    fromColumn: 'user_id',
  })
})

test('retorna null quando a coluna não representa chave estrangeira', () => {
  const result = resolveForeignKeyTarget('nome_completo', {}, ['users'], 'users')
  assert.equal(result, null)
})

