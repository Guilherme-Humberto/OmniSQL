import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 120ms ease-out;
`

export const ModalBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 860px;
  height: 84vh;
  max-height: 740px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`

export const ModalHeader = styled.header`
  display: flex;
  height: 52px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
`

export const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--foreground);
`

export const HeaderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  font-size: 11px;
  font-weight: 600;
`

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
  }
`

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  gap: 16px;
`

export const ControlCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-raised);
  gap: 10px;
`

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const FormatSelector = styled.div`
  display: flex;
  gap: 8px;
`

export const FormatButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--brand)' : 'var(--border)')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? 'var(--brand-soft)' : 'var(--surface)')};
  color: ${({ $active }) => ($active ? 'var(--brand)' : 'var(--foreground-muted)')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--brand-soft)' : 'var(--surface-active)')};
    color: ${({ $active }) => ($active ? 'var(--brand)' : 'var(--foreground)')};
  }
`

export const QuickActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`

export const StyledCheckbox = styled.input`
  cursor: pointer;
  accent-color: var(--brand);
  width: 14px;
  height: 14px;
`

export const RuleBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $active }) => ($active ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-muted)')};
  color: ${({ $active }) => ($active ? '#10b981' : 'var(--foreground-muted)')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)')};
`

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground-muted);
`

export const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: var(--foreground);
  font-size: 11px;
  outline: none;
  width: 120px;

  &::placeholder {
    color: var(--foreground-muted);
  }
`

export const BulkRuleSelect = styled.select`
  padding: 3px 6px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font-size: 11px;
  outline: none;
  cursor: pointer;

  &:hover {
    border-color: var(--border-strong);
  }
`

export const QuickButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
    border-color: var(--border-strong);
  }
`

export const ColumnsTable = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
`

export const ColumnRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-muted);
  }
`

export const ColumnDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`

export const ColumnName = styled.span`
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const PiiTag = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 600;
`

export const SelectRule = styled.select`
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-raised);
  color: var(--foreground);
  font-size: 12px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: var(--brand);
  }
`

export const PreviewCard = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-raised);
  overflow: hidden;
`

export const PreviewScroll = styled.div`
  flex: 1;
  max-height: 180px;
  overflow: auto;
  background: var(--surface);
`

export const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: var(--font-mono);
`

export const PreviewTh = styled.th`
  position: sticky;
  top: 0;
  padding: 6px 10px;
  text-align: left;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border);
  color: var(--foreground-muted);
  font-weight: 600;
  white-space: nowrap;
`

export const PreviewTd = styled.td<{ $masked?: boolean }>`
  padding: 5px 10px;
  border-bottom: 1px solid var(--border);
  color: ${({ $masked }) => ($masked ? '#10b981' : 'var(--foreground)')};
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const ModalFooter = styled.footer`
  display: flex;
  height: 56px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-top: 1px solid var(--border);
  background: var(--surface-raised);
`

export const FooterSummary = styled.span`
  font-size: 12px;
  color: var(--foreground-muted);
`

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const SecondaryButton = styled.button`
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--foreground-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
  }
`

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  background: var(--brand);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 120ms ease;

  &:hover {
    opacity: 0.9;
  }
`

