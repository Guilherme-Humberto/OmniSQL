import styled from 'styled-components'

export const Sidebar = styled.aside`
  display: flex;
  width: 248px;
  min-width: 210px;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--border);
  background: var(--sidebar);
`

export const SidebarHeader = styled.div`
  display: flex;
  height: 48px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid var(--border);
`

export const WorkspaceName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 650;
`

export const LocalBadge = styled.span`
  padding: 2px 5px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--foreground-muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.3px;
`

export const IconButton = styled.button`
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.5;
  }
`

export const ScrollContent = styled.div`
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 14px 8px;
`

export const Section = styled.section`
  & + & {
    margin-top: 22px;
  }
`

export const SectionHeader = styled.div`
  display: flex;
  min-height: 28px;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  color: var(--foreground-muted);
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
`

export const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
`

export const ConnectionList = styled.div`
  display: grid;
  gap: 2px;
  margin-top: 4px;
`

export const ConnectionRow = styled.div<{ $active: boolean }>`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--accent)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

export const ConnectionSelect = styled.button`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
`

export const ConnectionText = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const EmptyConnections = styled.div`
  padding: 10px 8px 12px;
  color: var(--foreground-muted);
  font-size: 11px;
  line-height: 1.6;
`

export const EmptyActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 9px;
`

export const TextButton = styled.button`
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

export const SearchBox = styled.label`
  display: flex;
  height: 28px;
  align-items: center;
  gap: 7px;
  margin: 4px 4px 5px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--foreground-muted);
`

export const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
  font: inherit;
  font-size: 11px;

  &::placeholder {
    color: var(--foreground-subtle);
  }
`

export const TableList = styled.div`
  display: grid;
  gap: 1px;
`

export const TableButton = styled.button`
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 6px 9px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  font: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

export const TableName = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ErrorMessage = styled.div`
  margin: 8px 8px 0;
  padding: 8px;
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  border-radius: 4px;
  color: var(--danger);
  font-size: 11px;
  overflow-wrap: anywhere;
`

export const SidebarFooter = styled.footer`
  padding: 9px 14px;
  border-top: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 10px;
`

