import { randomUUID } from 'node:crypto'
import { Worker } from 'node:worker_threads'
import { basename, join, resolve } from 'node:path'
import type {
  DatabaseColumn,
  DatabaseConnection,
  DatabaseQueryResult,
  DatabaseSchema,
  DatabaseTable,
} from '@/conveyor/database-contracts'
import type {
  DatabaseWorkerCommand,
  DatabaseWorkerMessage,
  DatabaseWorkerResponse,
  DatabaseWorkerResults,
} from './database-worker-contracts'

interface ManagedConnection {
  connection: DatabaseConnection
  adapter: WorkerDatabaseAdapter
}

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

class WorkerDatabaseAdapter {
  private readonly worker: Worker
  private readonly ready: Promise<void>
  private readonly pending = new Map<number, PendingRequest>()
  private nextRequestId = 0
  private isReady = false
  private failure: Error | null = null
  private rejectReady!: (error: Error) => void
  private closing = false

  constructor(path: string) {
    this.worker = new Worker(join(__dirname, 'databaseWorker.js'), { workerData: { path } })
    this.ready = new Promise((resolveReady, rejectReady) => {
      this.rejectReady = rejectReady
      this.worker.on('message', (message: DatabaseWorkerResponse) => {
        if ('type' in message && message.type === 'ready') {
          this.isReady = true
          resolveReady()
          return
        }
        if (!('id' in message)) return

        const request = this.pending.get(message.id)
        if (!request) return
        this.pending.delete(message.id)
        if (message.error) request.reject(new Error(message.error))
        else request.resolve(message.result)
      })
      this.worker.on('error', (error) => this.fail(error instanceof Error ? error : new Error(String(error))))
      this.worker.on('exit', (code) => {
        if (!this.closing || this.pending.size > 0) {
          this.fail(new Error(`Worker SQLite encerrado inesperadamente (${code}).`))
        }
      })
    })
  }

  listTables(): Promise<DatabaseTable[]> {
    return this.request({ method: 'listTables' })
  }

  getSchema(): Promise<DatabaseSchema> {
    return this.request({ method: 'getSchema' })
  }

  listColumns(tableName: string): Promise<DatabaseColumn[]> {
    return this.request({ method: 'listColumns', argument: tableName })
  }

  execute(sql: string): Promise<DatabaseQueryResult> {
    return this.request({ method: 'execute', argument: sql })
  }

  async close(): Promise<void> {
    if (this.closing) return
    this.closing = true
    // A terminação interrompe consultas longas que ainda não podem ler uma mensagem de fechamento.
    await this.worker.terminate()
  }

  private request<Command extends DatabaseWorkerCommand>(
    command: Command
  ): Promise<DatabaseWorkerResults[Command['method']]> {
    if (this.failure) return Promise.reject(this.failure)
    return this.ready.then(() => {
      if (this.failure) throw this.failure
      return new Promise<DatabaseWorkerResults[Command['method']]>((resolveRequest, rejectRequest) => {
        const id = this.nextRequestId++
        this.pending.set(id, {
          resolve: (value) => resolveRequest(value as DatabaseWorkerResults[Command['method']]),
          reject: rejectRequest,
        })
        const message = { id, ...command } as DatabaseWorkerMessage
        this.worker.postMessage(message)
      })
    })
  }

  private fail(error: Error): void {
    if (this.failure) return
    this.failure = error
    if (!this.isReady) this.rejectReady(error)
    for (const request of this.pending.values()) request.reject(error)
    this.pending.clear()
  }
}

export class DatabaseService {
  private readonly connections = new Map<string, ManagedConnection>()
  private readonly openings = new Map<string, Promise<DatabaseConnection>>()

  async openSQLite(path: string): Promise<DatabaseConnection> {
    const absolutePath = resolve(path)
    const existing = [...this.connections.values()].find((entry) => entry.connection.path === absolutePath)
    if (existing) return existing.connection

    const pending = this.openings.get(absolutePath)
    if (pending) return pending

    const opening = this.createConnection(absolutePath)
    this.openings.set(absolutePath, opening)
    try {
      return await opening
    } finally {
      this.openings.delete(absolutePath)
    }
  }

  listTables(connectionId: string): Promise<DatabaseTable[]> {
    return this.getConnection(connectionId).adapter.listTables()
  }

  getSchema(connectionId: string): Promise<DatabaseSchema> {
    return this.getConnection(connectionId).adapter.getSchema()
  }

  listColumns(connectionId: string, tableName: string): Promise<DatabaseColumn[]> {
    return this.getConnection(connectionId).adapter.listColumns(tableName)
  }

  execute(connectionId: string, sql: string): Promise<DatabaseQueryResult> {
    return this.getConnection(connectionId).adapter.execute(sql)
  }

  async close(connectionId: string): Promise<void> {
    const entry = this.connections.get(connectionId)
    if (!entry) return
    try {
      await entry.adapter.close()
    } finally {
      this.connections.delete(connectionId)
    }
  }

  async closeAll(): Promise<void> {
    await Promise.allSettled([...this.connections.keys()].map((connectionId) => this.close(connectionId)))
  }

  private async createConnection(path: string): Promise<DatabaseConnection> {
    const connection: DatabaseConnection = {
      id: randomUUID(),
      name: basename(path),
      path,
      driver: 'sqlite',
    }
    const adapter = new WorkerDatabaseAdapter(path)

    try {
      // Aguarda o SQLite abrir o arquivo no worker antes de expor a conexão ao renderer.
      await adapter.getSchema()
      this.connections.set(connection.id, { connection, adapter })
      return connection
    } catch (error) {
      await adapter.close()
      throw error
    }
  }

  private getConnection(connectionId: string): ManagedConnection {
    const connection = this.connections.get(connectionId)
    if (!connection) throw new Error('A conexao nao esta mais aberta.')
    return connection
  }
}

export const databaseService = new DatabaseService()
