import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

export const OverlayBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(1.5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

export const PeekCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 140ms ease-out;
`

export const PeekHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
`

export const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const TableBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--brand);
`

export const IdPill = styled.span`
  background: var(--accent);
  color: var(--foreground);
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 11px;
  font-family: 'JetBrains Mono Variable', monospace;
  font-weight: 600;
`

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

export const PeekBody = styled.div`
  padding: 12px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const FieldRow = styled.div<{ $isPk?: boolean }>`
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  background: ${({ $isPk }) => ($isPk ? 'rgba(217, 119, 6, 0.08)' : 'transparent')};
  border: 1px solid ${({ $isPk }) => ($isPk ? 'rgba(217, 119, 6, 0.25)' : 'transparent')};
  font-size: 11px;

  &:hover {
    background: var(--surface-raised);
  }
`

export const FieldKey = styled.div`
  font-weight: 600;
  color: var(--foreground-muted);
  font-family: 'JetBrains Mono Variable', monospace;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const FieldVal = styled.div`
  color: var(--foreground);
  font-family: 'JetBrains Mono Variable', monospace;
  word-break: break-all;
  user-select: text;

  .null-indicator {
    color: var(--foreground-subtle);
    font-style: italic;
  }
`

export const PeekFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  background: var(--surface-raised);
`

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--accent);
  }
`

export const HintText = styled.span`
  font-size: 10px;
  color: var(--foreground-subtle);
`

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 16px;
  color: var(--foreground-muted);
  font-size: 12px;
`

export const ErrorNotice = styled.div`
  padding: 14px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--danger);
  font-size: 11px;
  line-height: 1.5;
`

