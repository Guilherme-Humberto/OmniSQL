import styled from 'styled-components'
import type { ConnectionDriver } from '@/conveyor/connection-contracts'
import { DatabaseDriver } from '@/app/constants/app-constants'

export const ItemContainer = styled.div<{ $active: boolean; $colorHex: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface);
    border-color: ${({ $active }) => ($active ? 'var(--brand)' : 'var(--border)')};

    .item-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background-color: ${({ $colorHex }) => $colorHex};
  }
`

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: 2px;
`

export const ItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`

export const ItemName = styled.span<{ $active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ItemSub = styled.span`
  font-size: 10px;
  color: var(--foreground-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const DriverTag = styled.span<{ $driver: ConnectionDriver }>`
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid var(--border);
  background: var(--surface-raised);
  color: ${({ $driver }) =>
    $driver === DatabaseDriver.SQLite
      ? '#38bdf8'
      : $driver === DatabaseDriver.PostgreSQL
        ? '#60a5fa'
        : '#fb923c'};
`

export const ItemActions = styled.div`
  opacity: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: opacity 120ms ease;
`

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;

  &:hover {
    background: var(--accent);
    color: var(--danger);
  }
`

