import { dialog } from 'electron'
import { existsSync, statSync } from 'node:fs'
import { basename } from 'node:path'
import { z } from 'zod'
import { DatabaseDriver } from '@/app/constants/app-constants'
import {
  connectResultSchema,
  connectionDraftSchema,
  connectionProfileSchema,
  testResultSchema,
} from '../connection-contracts'
import { command, defineModule, query } from '../init'
import { connectionStore } from '@/lib/main/connection-store'
import { databaseService } from '@/lib/main/database-service'

const idInputSchema = z.object({ id: z.uuid() })

export const connectionsModule = defineModule({
  list: query(z.void(), () => z.array(connectionProfileSchema).parse(connectionStore.list())),

  pickSQLiteFile: command(async () => {
    const selection = await dialog.showOpenDialog({
      title: 'Selecionar banco SQLite',
      properties: ['openFile'],
      filters: [{ name: 'Bancos SQLite', extensions: ['db', 'sqlite', 'sqlite3', 'db3'] }],
    })
    if (selection.canceled || !selection.filePaths[0]) return null
    const filePath = selection.filePaths[0]
    connectionStore.approvePath(filePath)
    return {
      path: filePath,
      name: basename(filePath),
    }
  }),

  createSQLiteFile: command(async () => {
    const selection = await dialog.showSaveDialog({
      title: 'Criar novo arquivo SQLite',
      defaultPath: 'database.sqlite',
      filters: [{ name: 'Bancos SQLite', extensions: ['sqlite', 'db'] }],
    })
    if (selection.canceled || !selection.filePath) return null
    const filePath = selection.filePath
    connectionStore.approvePath(filePath)
    return {
      path: filePath,
      name: basename(filePath),
    }
  }),

  saveProfile: command(connectionDraftSchema, ({ input }) => {
    const saved = connectionStore.upsert(input, { saved: true, touch: false })
    return connectionProfileSchema.parse(saved)
  }),

  deleteProfile: command(idInputSchema, ({ input }) => {
    connectionStore.remove(input.id)
    return { success: true }
  }),

  forgetRecent: command(idInputSchema, ({ input }) => {
    connectionStore.forget(input.id)
    return { success: true }
  }),

  clearRecents: command(z.void(), () => {
    connectionStore.clearRecents()
    return { success: true }
  }),

  test: command(connectionDraftSchema, async ({ input }) => {
    const start = performance.now()
    if (input.config.driver === DatabaseDriver.SQLite) {
      const filePath = input.config.path
      if (!existsSync(filePath)) {
        return testResultSchema.parse({
          ok: false,
          message: 'O arquivo informado não existe no sistema de arquivos.',
          durationMs: Math.round(performance.now() - start),
        })
      }
      const stat = statSync(filePath)
      if (!stat.isFile()) {
        return testResultSchema.parse({
          ok: false,
          message: 'O caminho informado não é um arquivo válido.',
          durationMs: Math.round(performance.now() - start),
        })
      }
      connectionStore.approvePath(filePath)
    }

    const testRes = await databaseService.testConnection(input)
    return testResultSchema.parse({
      ok: testRes.success,
      message: testRes.message,
      durationMs: Math.round(performance.now() - start),
    })
  }),

  connect: command(connectionDraftSchema, async ({ input }) => {
    if (input.config.driver === DatabaseDriver.SQLite) {
      connectionStore.approvePath(input.config.path)
    }

    const connection = await databaseService.openFromDraft(input)
    // Atualiza / salva no connectionStore e marca como recente
    const profile = connectionStore.upsert(input, { saved: input.savePassword, touch: true })
    return connectResultSchema.parse({ connection, profile })
  }),
})
