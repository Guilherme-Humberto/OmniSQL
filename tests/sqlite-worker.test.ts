import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import { Worker } from 'node:worker_threads'

interface WorkerResponse {
  type?: string
  id?: number
  result?: unknown
  error?: string
}

test('executa consultas pelo worker compilado e encerra sem travar', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'sql-editor-worker-'))
  const worker = new Worker(resolve('out/main/databaseWorker.js'), {
    workerData: { path: join(directory, 'worker.sqlite') },
  })
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>()
  let nextId = 0
  let readyResolve!: () => void
  let readyReject!: (error: Error) => void
  const ready = new Promise<void>((resolveReady, rejectReady) => {
    readyResolve = resolveReady
    readyReject = rejectReady
  })

  worker.on('message', (message: WorkerResponse) => {
    if (message.type === 'ready') {
      readyResolve()
      return
    }
    if (message.id === undefined) return
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error))
    else request.resolve(message.result)
  })
  worker.on('error', (error) => readyReject(error instanceof Error ? error : new Error(String(error))))

  const request = <Result>(method: string, argument?: string) =>
    new Promise<Result>((resolveRequest, rejectRequest) => {
      const id = nextId++
      pending.set(id, {
        resolve: (value) => resolveRequest(value as Result),
        reject: rejectRequest,
      })
      worker.postMessage({ id, method, ...(argument === undefined ? {} : { argument }) })
    })

  try {
    await ready
    await request('execute', 'CREATE TABLE samples (id INTEGER PRIMARY KEY, label TEXT)')
    await request('execute', "INSERT INTO samples(label) VALUES ('IPC OK')")

    const schema = await request<{ columnsByTable: Record<string, string[]> }>('getSchema')
    assert.deepEqual(schema.columnsByTable.samples, ['id', 'label'])

    const result = await request<{ rows: unknown[][] }>('execute', 'SELECT id, label FROM samples')
    assert.deepEqual(result.rows, [[1, 'IPC OK']])
  } finally {
    await worker.terminate()
    rmSync(directory, { recursive: true, force: true })
  }
})
