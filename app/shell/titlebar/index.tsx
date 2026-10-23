import { useEffect, type ReactNode } from 'react'
import { Minus, Square, Copy, X, Sun, Moon } from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import { ThemeMode } from '../../constants/app-constants'
import { useWindowStore } from '../window-store'
import { useThemeStore } from '../theme-store'
import { TitlebarMenu } from '../titlebar-menu'
import {
  Header,
  Left,
  AppMark,
  CenterTitle,
  Actions,
  Controls,
  Control,
} from './styles'

interface TitlebarProps {
  title?: string
}

export function Titlebar({ title = 'SQL Editor' }: TitlebarProps) {
  const platform = useWindowStore((s) => s.platform)
  const menuVisible = useWindowStore((s) => s.menuVisible)
  const toggleMenu = useWindowStore((s) => s.toggleMenu)
  const isMac = platform === 'darwin'

  // Alt exibe/oculta o menu bar no estilo desktop tradicional
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && !e.repeat) {
        e.preventDefault()
        toggleMenu()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleMenu])

  return (
    <Header $mac={isMac}>
      <Left>
        {!isMac && <AppMark />}
        {menuVisible && <TitlebarMenu />}
      </Left>

      <CenterTitle>{title}</CenterTitle>

      <Actions>
        <ThemeToggle />
        {!isMac && <WindowControls />}
      </Actions>
    </Header>
  )
}

function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const Icon = theme === ThemeMode.Dark ? Sun : Moon
  return (
    <ControlButton label="Alternar tema" onClick={toggle}>
      <Icon size={16} />
    </ControlButton>
  )
}

function WindowControls() {
  const minimizable = useWindowStore((s) => s.minimizable)
  const maximizable = useWindowStore((s) => s.maximizable)
  const isMaximized = useWindowStore((s) => s.isMaximized)

  return (
    <Controls>
      {minimizable && (
        <ControlButton label="Minimizar" onClick={() => conveyor.window.minimize()}>
          <Minus size={16} />
        </ControlButton>
      )}
      {maximizable && (
        <ControlButton label="Maximizar" onClick={() => conveyor.window.maximizeToggle()}>
          {isMaximized ? <Copy size={14} /> : <Square size={14} />}
        </ControlButton>
      )}
      <ControlButton label="Fechar" onClick={() => conveyor.window.close()} destructive>
        <X size={16} />
      </ControlButton>
    </Controls>
  )
}

function ControlButton({
  children,
  label,
  onClick,
  destructive,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <Control type="button" aria-label={label} onClick={onClick} $destructive={destructive}>
      {children}
    </Control>
  )
}

