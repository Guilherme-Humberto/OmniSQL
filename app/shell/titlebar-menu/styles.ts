import styled, { keyframes } from 'styled-components'

const appear = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`

export const MenuRegion = styled.div`
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
`

export const MenuEntry = styled.div`
  position: relative;
`

export const MenuTrigger = styled.button<{ $active: boolean }>`
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--accent)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 13px;
  cursor: default;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

export const MenuPanel = styled.div`
  position: absolute;
  z-index: 50;
  top: calc(100% + 4px);
  left: 0;
  min-width: 240px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--foreground);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  animation: ${appear} 120ms ease-out;
`

export const MenuSeparator = styled.div`
  height: 1px;
  margin: 4px 0;
  background: var(--border);
`

export const MenuItem = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 6px 10px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  cursor: default;

  &:hover {
    background: var(--accent);
  }
`

export const Shortcut = styled.span`
  color: var(--foreground-muted);
  font-size: 12px;
`

