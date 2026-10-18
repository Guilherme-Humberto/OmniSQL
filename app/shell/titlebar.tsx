import { useEffect, type ReactNode } from 'react'
import styled from 'styled-components'
import { Minus, Square, Copy, X, Sun, Moon } from 'lucide-react'
import { conveyor } from '@/conveyor/client'
import { useWindowStore } from './window-store'
import { useThemeStore } from './theme-store'
import { TitlebarMenu } from './titlebar-menu'

const Header = styled.header<{ $mac: boolean }>`
  position: relative;
  display: flex;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  padding-left: ${({ $mac }) => ($mac ? '80px' : '0')};
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  user-select: none;
  -webkit-app-region: drag;
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
  -webkit-app-region: no-drag;
`

const AppMark = styled.span`
  width: 13px;
  height: 13px;
  border-radius: 4px;
  background: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
`

const CenterTitle = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: var(--foreground-muted);
  font-size: 13px;
  font-weight: 500;
`

const Actions = styled.div`
  display: flex;
  margin-left: auto;
  -webkit-app-region: no-drag;
`

const Controls = styled.div`
  display: flex;
`

const Control = styled.button<{ $destructive?: boolean }>`
  display: flex;
  width: 44px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--foreground-muted);
  cursor: default;
  transition:
    background 120ms ease,
    color 120ms ease;

  &:hover {
    background: ${({ $destructive }) => ($destructive ? 'var(--danger)' : 'var(--accent)')};
    color: ${({ $destructive }) => ($destructive ? '#fff' : 'var(--foreground)')};
  }
`

export function Titlebar({ title = 'SQL Editor' }: { title?: string }) {
  const platform = useWindowStore((s) => s.platform)
  const menuVisible = useWindowStore((s) => s.menuVisible)
  const toggleMenu = useWindowStore((s) => s.toggleMenu)
  const isMac = platform === 'darwin'

  // Alt shows/hides the menu bar, like a normal Electron window.
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
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <ControlButton label="Toggle theme" onClick={toggle}>
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
        <ControlButton label="Minimize" onClick={() => conveyor.window.minimize()}>
          <Minus size={16} />
        </ControlButton>
      )}
      {maximizable && (
        <ControlButton label="Maximize" onClick={() => conveyor.window.maximizeToggle()}>
          {isMaximized ? <Copy size={14} /> : <Square size={14} />}
        </ControlButton>
      )}
      <ControlButton label="Close" onClick={() => conveyor.window.close()} destructive>
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
