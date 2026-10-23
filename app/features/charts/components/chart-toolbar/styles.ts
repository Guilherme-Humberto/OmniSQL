import styled from 'styled-components'

export const Toolbar = styled.div`
  display: flex;
  height: 38px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
  font-size: 11px;
`

export const Toolgroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const TypeButtonGroup = styled.div`
  display: flex;
  align-items: center;
  padding: 2px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 5px;
`

export const TypeButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1b100d' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? '650' : '500')};
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    color: ${({ $active }) => ($active ? '#1b100d' : 'var(--foreground)')};
  }
`

export const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--foreground-muted);
  font-size: 11px;
`

export const Select = styled.select`
  height: 24px;
  padding: 0 20px 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  outline: 0;
  cursor: pointer;

  &:focus {
    border-color: var(--brand);
  }
`

