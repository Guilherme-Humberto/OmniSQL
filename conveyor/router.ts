import type { BrowserWindow } from 'electron'
import { createRouter, devLogger } from 'electron-conveyor/main'
import { windows, openAppWindow } from '@/lib/main/app'
import { windowModule, setupWindowEvents } from './modules/window'
import { webModule } from './modules/web'
import { databaseModule } from './modules/database'
import { connectionsModule } from './modules/connections'
import { aiModule } from './modules/ai'
import { crossDbModule } from './modules/cross-db'

/**
 * The app's whole IPC surface — modules, stores, context, global middleware — registered in one
 * place. Runtime is MAIN-ONLY; the renderer imports only `type AppRouter`. `window` and `web` are
 * the core modules (the titlebar needs them); add your own next to them in `modules/`.
 */

/** Main-process start time — surfaced to handlers as `ctx.appStartedAt`. */
const APP_STARTED_AT = Date.now()

export const router = createRouter(
  {
    window: windowModule,
    web: webModule,
    database: databaseModule,
    connections: connectionsModule,
    ai: aiModule,
    crossDb: crossDbModule,
  },
  {
    createContext: () => ({ appStartedAt: APP_STARTED_AT, windows, openWindow: openAppWindow }),
    use: [devLogger], // per-call timing in dev, a no-op in packaged builds
  }
)

export type AppRouter = typeof router

/** Wire per-window push events. Call once per created window. */
export function setupEvents(win: BrowserWindow): void {
  setupWindowEvents(win)
}
