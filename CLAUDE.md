# SQL Editor

Desktop SQL client built with Electron, React, TypeScript and styled-components.

- Checks: `npm run typecheck`, `npm run lint:check`, `npm run format:check`.
- Keep database drivers and native access in the main process; the renderer uses typed IPC.
- `conveyor/modules/*` run in main only; the renderer imports only `type AppRouter`.
