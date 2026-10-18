import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import styled from 'styled-components'
import { conveyor } from '@/conveyor/client'
import { Titlebar } from './titlebar'
import { useWindowStore } from './window-store'
import { useThemeStore } from './theme-store'

const Frame = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: var(--background);
  color: var(--foreground);
`

const Content = styled.main`
  min-height: 0;
  flex: 1;
  overflow: hidden;
`

/**
 * The app shell: themed titlebar + a scrollable content region. Hydrates window state from
 * `window.init()`, keeps focus/maximize live via the window module's push events, and applies the
 * light/dark theme. Wrap the app's content in this.
 */
export function WindowFrame({ title, children }: { title?: string; children?: ReactNode }) {
  const setInit = useWindowStore((s) => s.setInit)
  const setFocused = useWindowStore((s) => s.setFocused)
  const setMaximized = useWindowStore((s) => s.setMaximized)
  const theme = useThemeStore((s) => s.theme)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    conveyor.window
      .init()
      .then((i) => setInit({ platform: i.platform, minimizable: i.minimizable, maximizable: i.maximizable }))
  }, [setInit])

  conveyor.window.onFocusChange.useEvent(setFocused)
  conveyor.window.onMaximizeChange.useEvent(setMaximized)

  return (
    <Frame>
      <Titlebar title={title} />
      <Content>{children}</Content>
    </Frame>
  )
}
