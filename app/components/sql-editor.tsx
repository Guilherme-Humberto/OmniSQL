import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import { EditorView, keymap } from '@codemirror/view'
import styled from 'styled-components'
import type { QueryTab } from './workspace-store'
import { useThemeStore } from '../shell/theme-store'

const EditorSurface = styled.div`
  min-height: 0;
  flex: 1;

  .cm-editor {
    height: 100%;
    background: transparent;
    color: var(--foreground);
    font-size: 13px;
  }

  .cm-scroller {
    font-family: 'JetBrains Mono Variable', monospace;
    line-height: 1.65;
  }

  .cm-gutters {
    border: 0;
    background: transparent;
    color: var(--foreground-muted);
  }

  .cm-activeLine,
  .cm-activeLineGutter {
    background: var(--editor-active-line);
  }

  .cm-cursor {
    border-left-color: var(--brand);
  }
`

interface SqlEditorProps {
  tab: QueryTab
  schema: Record<string, string[]>
  onChange: (sql: string) => void
  onRun: () => void
}

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
        { dark: theme === 'dark' }
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
