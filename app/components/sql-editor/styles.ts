import styled from 'styled-components'

export const EditorSurface = styled.div`
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

