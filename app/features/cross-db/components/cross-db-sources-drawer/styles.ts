import styled from 'styled-components'

export const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
`

export const DrawerContainer = styled.aside`
  width: 440px;
  max-width: 90vw;
  height: 100%;
  background: var(--surface-raised);
  border-left: 1px solid var(--border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: slideIn 160ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`

export const DrawerHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
`

export const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--foreground);
`

export const DuckDbBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 9999px;
  background: rgba(255, 230, 0, 0.15);
  border: 1px solid rgba(255, 230, 0, 0.35);
  color: #eab308;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
    border-color: var(--border-strong);
  }
`

export const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`

export const InfoBanner = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 12px;
  line-height: 1.5;
  color: var(--foreground-muted);

  strong {
    color: var(--foreground);
  }
`

export const ActionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
`

export const AttachFileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 6px;
  border: 1px dashed var(--brand);
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 140ms ease;

  &:hover {
    background: var(--brand);
    color: #fff;
    border-style: solid;
  }
`

export const SourcesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const SourceCard = styled.div`
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
`

export const SourceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
`

export const SourceTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const SchemaCode = styled.code`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--brand);
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
`

export const TableItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 12px;
  font-family: var(--font-mono);
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-muted);
  }
`

export const InsertSnippetButton = styled.button`
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--foreground-muted);
  font-size: 10px;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    color: var(--foreground);
    background: var(--surface-active);
    border-color: var(--border-strong);
  }
`

export const ExampleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ExampleButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--foreground);
  cursor: pointer;
  text-align: left;
  transition: all 120ms ease;

  &:hover {
    border-color: var(--brand);
    background: var(--surface-active);
  }

  strong {
    font-size: 12px;
    color: var(--foreground);
  }

  span {
    font-size: 11px;
    color: var(--foreground-muted);
  }
`

