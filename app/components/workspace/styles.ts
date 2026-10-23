import styled from 'styled-components'
import { Circle } from 'lucide-react'

export const Layout = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  grid-template-columns: 248px minmax(0, 1fr);

  @media (max-width: 760px) {
    grid-template-columns: 190px minmax(0, 1fr);
  }
`

export const Main = styled.main`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: var(--background);
`

export const Toolbar = styled.header`
  display: flex;
  min-height: 44px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
`

export const Location = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: var(--foreground-muted);
  font-size: 11px;
`

export const LocationName = styled.strong`
  max-width: 260px;
  overflow: hidden;
  color: var(--foreground);
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ConnectionSelect = styled.select`
  width: min(190px, 22vw);
  height: 29px;
  padding: 0 26px 0 9px;
  border: 1px solid var(--border);
  border-radius: 4px;
  outline: 0;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;

  &:focus-visible {
    border-color: var(--brand);
  }
`

export const RunButton = styled.button`
  display: inline-flex;
  height: 29px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 1px solid var(--brand);
  border-radius: 4px;
  background: var(--brand);
  color: #1b100d;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.06);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`

export const Shortcut = styled.kbd`
  padding: 2px 4px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--foreground-muted);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 9px;
`

export const ToolbarButton = styled.button`
  display: inline-flex;
  height: 29px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  font-weight: 550;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--accent);
    border-color: var(--foreground-muted);
  }
`

export const TabsBar = styled.div`
  display: flex;
  height: 37px;
  flex: none;
  align-items: stretch;
  gap: 2px;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
`

export const QueryTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  min-width: 132px;
  max-width: 210px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 11px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: var(--surface);
  }
`

export const QueryTabItem = styled.div`
  display: inline-flex;
  align-items: stretch;
`

export const TabLabel = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const CloseTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  border: 0;
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: inherit;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

export const AddTabButton = styled.button`
  display: inline-flex;
  width: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;

  &:hover {
    color: var(--foreground);
  }
`

export const EditorToolbar = styled.div`
  display: flex;
  height: 34px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 10px;
`

export const EditorPane = styled.section`
  display: flex;
  min-height: 220px;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
`

export const EditorAndResults = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
`

export const Status = styled.div`
  display: flex;
  height: 24px;
  flex: none;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border-top: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 10px;
`

export const StatusDot = styled(Circle)<{ $connected: boolean }>`
  fill: ${({ $connected }) => ($connected ? 'var(--success)' : 'var(--foreground-subtle)')};
  color: ${({ $connected }) => ($connected ? 'var(--success)' : 'var(--foreground-subtle)')};
`

export const EmptyEditor = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: var(--foreground-muted);
  font-size: 12px;
`

