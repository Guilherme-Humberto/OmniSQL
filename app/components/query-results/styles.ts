import styled from 'styled-components'

export const Panel = styled.section`
  display: flex;
  min-height: 220px;
  flex: 1;
  flex-direction: column;
  border-top: 1px solid var(--border);
  background: var(--surface);
`

export const PanelHeader = styled.header`
  display: flex;
  height: 38px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 12px;
`

export const ViewTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--surface-raised);
  padding: 2px;
  border-radius: 5px;
  border: 1px solid var(--border);
`

export const ViewTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? '650' : '500')};
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none')};
  transition: all 120ms ease;

  &:hover:not(:disabled) {
    color: var(--foreground);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const PanelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--foreground-muted);
  font-size: 11px;
`

export const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-raised);
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

export const ScrollArea = styled.div`
  min-height: 0;
  flex: 1;
  overflow: auto;
`

export const Table = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
`

export const HeaderCell = styled.th`
  position: sticky;
  z-index: 1;
  top: 0;
  min-width: 150px;
  padding: 8px 12px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
  color: var(--foreground-muted);
  font-size: 11px;
  font-weight: 600;
  text-align: left;
`

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`

export const FkBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(217, 119, 6, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(217, 119, 6, 0.3);
  font-weight: 700;
  text-transform: uppercase;
`

export const DataCell = styled.td<{ $null: boolean; $isFk?: boolean; $isModifierActive?: boolean }>`
  max-width: 360px;
  padding: 7px 12px;
  overflow: hidden;
  border-right: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
  color: ${({ $null }) => ($null ? 'var(--foreground-subtle)' : 'var(--foreground)')};
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;

  ${({ $isFk, $isModifierActive, $null }) =>
    $isFk &&
    !$null &&
    `
    cursor: ${$isModifierActive ? 'pointer' : 'default'};
    text-decoration: ${$isModifierActive ? 'underline dotted var(--brand)' : 'none'};
    text-underline-offset: 3px;

    &:hover {
      text-decoration: underline dotted var(--brand);
      cursor: pointer;
      color: var(--brand);
    }
  `}
`

export const EmptyState = styled.div`
  display: flex;
  height: 100%;
  min-height: 132px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--foreground-muted);
  font-size: 12px;
`

export const ErrorState = styled(EmptyState)`
  color: var(--danger);
`

export const Footer = styled.footer`
  display: flex;
  height: 30px;
  flex: none;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  border-top: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 11px;
`

