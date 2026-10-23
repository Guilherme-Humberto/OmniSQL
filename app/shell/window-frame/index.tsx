import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { conveyor } from '@/conveyor/client'
import { ThemeMode } from '../../constants/app-constants'
import { Titlebar } from '../titlebar'
import { useWindowStore } from '../window-store'
import { useThemeStore } from '../theme-store'
import { Frame, Content } from './styles'

interface WindowFrameProps {
  title?: string
  children?: ReactNode
}

/**
 * Shell da janela da aplicação: barra de título customizada e área principal.
 */
export function WindowFrame({ title, children }: WindowFrameProps) {
  const setInit = useWindowStore((s) => s.setInit)
  const setFocused = useWindowStore((s) => s.setFocused)
  const setMaximized = useWindowStore((s) => s.setMaximized)
  const theme = useThemeStore((s) => s.theme)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === ThemeMode.Dark)
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

