import { parentPort, workerData } from 'node:worker_threads'
import { SQLiteAdapter } from './sqlite-adapter'
import type { DatabaseWorkerMessage } from './database-worker-contracts'

const port = parentPort
if (!port) throw new Error('O worker SQLite precisa ser iniciado pelo processo principal.')

const adapter = new SQLiteAdapter(workerData.path)
port.postMessage({ type: 'ready' })

port.on('message', (message: DatabaseWorkerMessage) => {
  const { id, method } = message
  try {
    let result: unknown
    switch (method) {
      case 'listTables':
        result = adapter.listTables()
        break
      case 'getSchema':
        result = adapter.getSchema()
        break
      case 'listColumns':
        result = adapter.listColumns(message.argument)
        break
      case 'execute':
        result = adapter.execute(message.argument)
        break
    }
    port.postMessage({ id, result })
  } catch (error) {
    port.postMessage({ id, error: error instanceof Error ? error.message : 'Erro desconhecido no worker SQLite.' })
  }
})
