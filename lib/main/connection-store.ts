import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { app, safeStorage } from 'electron'
import { z } from 'zod'
import {
  connectionColorSchema,
  connectionConfigSchema,
  type ConnectionConfig,
  type ConnectionDraft,
  type ConnectionProfile,
} from '@/conveyor/connection-contracts'
import { APP_LIMITS, DatabaseDriver } from '@/app/constants/app-constants'

const MAX_RECENTS = APP_LIMITS.MAX_RECENTS_COUNT

const storedProfileSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: connectionColorSchema,
  saved: z.boolean(),
  createdAt: z.number(),
  lastUsedAt: z.number().nullable(),
  config: connectionConfigSchema,
  /** Senha cifrada com `safeStorage`, em base64. Nunca é gravada em texto puro. */
  secret: z.string().nullable(),
})

const storeFileSchema = z.object({
  version: z.literal(1),
  profiles: z.array(storedProfileSchema),
})

type StoredProfile = z.infer<typeof storedProfileSchema>

/**
 * Perfis de conexão persistidos em `userData/connections.json`.
 *
 * Também mantém a lista de caminhos SQLite que o renderer pode abrir: apenas arquivos escolhidos
 * em um diálogo nativo nesta sessão ou já gravados em um perfil. Assim um caminho digitado no
 * renderer nunca chega ao SQLite.
 */
export class ConnectionStore {
  private profiles: StoredProfile[] | null = null
  private readonly approvedPaths = new Set<string>()

  private get file(): string {
    return join(app.getPath('userData'), 'connections.json')
  }

  list(): ConnectionProfile[] {
    return this.load().map(toPublic)
  }

  get(id: string): StoredProfile | undefined {
    return this.load().find((profile) => profile.id === id)
  }

  approvePath(path: string): string {
    const absolute = resolve(path)
    this.approvedPaths.add(absolute)
    return absolute
  }

  assertApproved(config: ConnectionConfig): void {
    if (config.driver !== DatabaseDriver.SQLite) return
    if (!this.approvedPaths.has(resolve(config.path))) {
      throw new Error('Selecione o arquivo SQLite pelo seletor de arquivos.')
    }
  }

  /** Grava (ou atualiza) um perfil. `saved: false` cria apenas uma entrada de "recentes". */
  upsert(draft: ConnectionDraft, options: { saved: boolean; touch: boolean }): ConnectionProfile {
    this.assertApproved(draft.config)
    const profiles = this.load()
    const existing = draft.id ? profiles.find((profile) => profile.id === draft.id) : undefined
    const now = Date.now()

    const secret = this.resolveSecret(draft, existing)
    const next: StoredProfile = {
      id: existing?.id ?? randomUUID(),
      name: draft.name.trim() || defaultName(draft.config),
      color: draft.color,
      saved: options.saved || Boolean(existing?.saved),
      createdAt: existing?.createdAt ?? now,
      lastUsedAt: options.touch ? now : (existing?.lastUsedAt ?? null),
      config: draft.config,
      secret,
    }

    this.profiles = existing
      ? profiles.map((profile) => (profile.id === next.id ? next : profile))
      : [...profiles, next]
    this.trimRecents()
    this.persist()
    return toPublic(next)
  }

  touch(id: string): ConnectionProfile | undefined {
    const profile = this.get(id)
    if (!profile) return undefined
    profile.lastUsedAt = Date.now()
    this.persist()
    return toPublic(profile)
  }

  /** Remove o perfil salvo. Se ele também é recente, mantém só o histórico. */
  remove(id: string): void {
    this.profiles = this.load().filter((profile) => profile.id !== id)
    this.persist()
  }

  /** Tira o perfil da lista de recentes; perfis não salvos somem por completo. */
  forget(id: string): void {
    this.profiles = this.load().flatMap((profile) => {
      if (profile.id !== id) return [profile]
      return profile.saved ? [{ ...profile, lastUsedAt: null }] : []
    })
    this.persist()
  }

  clearRecents(): void {
    this.profiles = this.load().flatMap((profile) => (profile.saved ? [{ ...profile, lastUsedAt: null }] : []))
    this.persist()
  }

  /** Senha em texto puro para o driver: a do formulário, ou a guardada no perfil. */
  passwordFor(draft: ConnectionDraft): string | undefined {
    if (draft.password) return draft.password
    const stored = draft.id ? this.get(draft.id) : undefined
    return stored?.secret ? decrypt(stored.secret) : undefined
  }

  private resolveSecret(draft: ConnectionDraft, existing: StoredProfile | undefined): string | null {
    if (draft.config.driver === DatabaseDriver.SQLite || !draft.savePassword) return null
    if (draft.password) return encrypt(draft.password)
    return existing?.secret ?? null
  }

  private trimRecents(): void {
    const unsaved = this.load()
      .filter((profile) => !profile.saved)
      .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))
    const drop = new Set(unsaved.slice(MAX_RECENTS).map((profile) => profile.id))
    if (drop.size) this.profiles = this.load().filter((profile) => !drop.has(profile.id))
  }

  private load(): StoredProfile[] {
    if (this.profiles) return this.profiles
    try {
      const parsed = storeFileSchema.safeParse(JSON.parse(readFileSync(this.file, 'utf8')))
      this.profiles = parsed.success ? parsed.data.profiles : []
    } catch {
      this.profiles = []
    }
    for (const profile of this.profiles) {
      if (profile.config.driver === DatabaseDriver.SQLite) this.approvePath(profile.config.path)
    }
    return this.profiles
  }

  private persist(): void {
    const file = this.file
    if (!existsSync(dirname(file))) mkdirSync(dirname(file), { recursive: true })
    // Escrita atômica: um crash no meio nunca deixa o arquivo pela metade.
    const temporary = `${file}.tmp`
    writeFileSync(temporary, JSON.stringify({ version: 1, profiles: this.load() }, null, 2), 'utf8')
    renameSync(temporary, file)
  }
}

function toPublic({ secret, ...profile }: StoredProfile): ConnectionProfile {
  return { ...profile, hasPassword: Boolean(secret) }
}

function defaultName(config: ConnectionConfig): string {
  if (config.driver === DatabaseDriver.SQLite) return config.path.split(/[\\/]/).pop() || 'SQLite'
  return `${config.host}:${config.port}${config.database ? `/${config.database}` : ''}`
}

function encrypt(value: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('O cofre de senhas do sistema não está disponível. Desmarque "Salvar senha".')
  }
  return safeStorage.encryptString(value).toString('base64')
}

function decrypt(value: string): string | undefined {
  try {
    return safeStorage.decryptString(Buffer.from(value, 'base64'))
  } catch {
    return undefined
  }
}

export const connectionStore = new ConnectionStore()
