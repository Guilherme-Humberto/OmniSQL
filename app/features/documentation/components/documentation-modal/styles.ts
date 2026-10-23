import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  animation: fadeIn 120ms ease-out;
`

export const ModalBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 940px;
  height: 86vh;
  max-height: 760px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
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
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--brand-soft);
  color: var(--brand);
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

export const TabBar = styled.div`
  display: flex;
  height: 42px;
  flex: none;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: 0 16px;
  gap: 8px;
`

export const TabItem = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 100%;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  background: transparent;
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    color: var(--foreground);
    background: var(--surface-muted);
  }
`

export const TabBadge = styled.span`
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--surface-active);
  color: var(--foreground-muted);
  font-size: 10px;
  font-weight: 600;
`

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  gap: 14px;
`

export const CodeCard = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-raised);
  overflow: hidden;
`

export const CodeCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
`

export const CodeCardTitle = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-raised);
  color: var(--foreground);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    border-color: var(--border-strong);
  }
`

export const CodeBox = styled.pre`
  margin: 0;
  padding: 14px;
  flex: 1;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--foreground);
  background: var(--surface-raised);
  white-space: pre;
`

export const AiBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-raised);
  gap: 12px;
`

export const AiInfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const AiModelSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font-size: 12px;
  outline: none;
`

export const SuggestionGrid = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
`

export const SuggestionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-muted);
  }
`

export const SuggestionField = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 180px;
`

export const TableTag = styled.span`
  font-size: 10px;
  color: var(--foreground-muted);
  font-family: var(--font-mono);
`

export const ColName = styled.span`
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--foreground);
`

export const CommentInput = styled.input`
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-raised);
  color: var(--foreground);
  font-size: 12px;
  outline: none;

  &:focus {
    border-color: var(--brand);
  }
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

