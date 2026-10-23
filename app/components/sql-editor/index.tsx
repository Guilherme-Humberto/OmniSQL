import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import { EditorView, keymap } from '@codemirror/view'
import type { QueryTab } from '../workspace-store'
import { ThemeMode } from '../../constants/app-constants'
import { useThemeStore } from '../../shell/theme-store'
import { EditorSurface } from './styles'

interface SqlEditorProps {
  tab: QueryTab
  schema: Record<string, string[]>
  onChange: (sql: string) => void
  onRun: () => void
}

/**
 * Editor SQL baseado em CodeMirror com autocompletion de schema e suporte a temas.
 */
export function SqlEditor({ tab, schema, onChange, onRun }: SqlEditorProps) {
  const theme = useThemeStore((state) => state.theme)
  const extensions = useMemo(
    () => [
      sql({ dialect: SQLite, schema }),
      EditorView.lineWrapping,
      EditorView.theme(
        {
          '&': { backgroundColor: 'transparent', color: 'var(--foreground)' },
          '.cm-content': { caretColor: 'var(--brand)' },
          '.cm-selectionBackground': { backgroundColor: 'var(--selection)' },
          '&.cm-focused .cm-selectionBackground': { backgroundColor: 'var(--selection)' },
        },
        { dark: theme === ThemeMode.Dark }
      ),
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            onRun()
            return true
          },
        },
      ]),
    ],
    [onRun, schema, theme]
  )

  return (
    <EditorSurface aria-label="Editor SQL">
      <CodeMirror
        value={tab.sql}
        height="100%"
        theme={theme}
        extensions={extensions}
        onChange={onChange}
        basicSetup={{ foldGutter: true, highlightActiveLine: true, highlightActiveLineGutter: true }}
      />
    </EditorSurface>
  )
}

