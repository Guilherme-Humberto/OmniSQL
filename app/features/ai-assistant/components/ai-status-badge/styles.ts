import styled from 'styled-components'

export const StatusPill = styled.div<{ $isOnline: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 550;
  background: ${({ $isOnline }) => ($isOnline ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)')};
  border: 1px solid ${({ $isOnline }) => ($isOnline ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)')};
  color: ${({ $isOnline }) => ($isOnline ? 'var(--success)' : 'var(--danger)')};
  user-select: none;
`

export const Dot = styled.span<{ $isOnline: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${({ $isOnline }) => ($isOnline ? 'var(--success)' : 'var(--danger)')};
  box-shadow: 0 0 6px ${({ $isOnline }) => ($isOnline ? 'rgba(74, 222, 128, 0.6)' : 'rgba(239, 68, 68, 0.6)')};
`

export const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 120ms ease;

  &:hover {
    opacity: 1;
  }
`

