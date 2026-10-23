import styled from 'styled-components'

export const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--border);
  background: var(--sidebar);
  user-select: none;
`

export const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
`

export const SidebarBrand = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const BrandTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
`

export const QuickConnectButton = styled.button`
  display: flex;
  width: 100%;
  height: 36px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid var(--brand);
  border-radius: 6px;
  background: var(--brand);
  color: #1b100d;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 140ms ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-0.5px);
  }

  &:active {
    transform: translateY(0);
  }
`

export const OutlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  font-weight: 550;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

export const SearchWrapper = styled.div`
  display: flex;
  height: 32px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--foreground-muted);
  transition: border-color 140ms;

  &:focus-within {
    border-color: var(--brand);
    color: var(--foreground);
  }
`

export const SearchInput = styled.input`
  width: 100%;
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

export const SmallButton = styled.button`
  border: 0;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;
  display: flex;
  padding: 2px;
`

export const ScrollList = styled.div`
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 4px 6px;
  color: var(--foreground-muted);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`

export const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 10px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  color: var(--foreground-muted);
  font-size: 9px;
  font-weight: 700;
`

export const ClearButton = styled.button`
  border: 0;
  background: transparent;
  color: var(--foreground-subtle);
  font-size: 10px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;

  &:hover {
    color: var(--foreground);
    background: var(--accent);
  }
`

export const EmptyMessage = styled.div`
  padding: 8px 10px;
  font-size: 11px;
  color: var(--foreground-muted);
`

