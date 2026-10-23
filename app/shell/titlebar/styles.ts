import styled from 'styled-components'

export const Header = styled.header<{ $mac: boolean }>`
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

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
  -webkit-app-region: no-drag;
`

export const AppMark = styled.span`
  width: 13px;
  height: 13px;
  border-radius: 4px;
  background: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
`

export const CenterTitle = styled.div`
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

export const Actions = styled.div`
  display: flex;
  margin-left: auto;
  -webkit-app-region: no-drag;
`

export const Controls = styled.div`
  display: flex;
`

export const Control = styled.button<{ $destructive?: boolean }>`
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

