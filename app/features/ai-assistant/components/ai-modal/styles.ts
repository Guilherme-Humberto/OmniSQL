import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`

export const ModalBox = styled.div`
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
`

export const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--foreground);
  display: flex;
  align-items: center;
  gap: 8px;
`

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

export const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`

export const ModeTabBar = styled.div`
  display: flex;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3px;
  gap: 4px;
`

export const ModeTabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  cursor: pointer;
  text-align: left;
  transition: all 140ms ease;
  box-shadow: ${({ $active }) => ($active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none')};

  &:hover {
    color: var(--foreground);
  }

  .title {
    font-size: 12px;
    font-weight: 650;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .subtitle {
    font-size: 10px;
    color: var(--foreground-subtle);
    margin-top: 2px;
  }
`

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

export const ModelSelectGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--foreground-muted);
`

export const Select = styled.select`
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-raised);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  outline: 0;
  cursor: pointer;

  &:focus {
    border-color: var(--brand);
  }
`

export const SafetyBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 550;
  color: var(--foreground-muted);
  background: var(--surface-raised);
  border: 1px solid var(--border);
  padding: 4px 8px;
  border-radius: 6px;
`

export const PromptTextarea = styled.textarea`
  width: 100%;
  min-height: 85px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-raised);
  color: var(--foreground);
  font: inherit;
  font-size: 12px;
  line-height: 1.5;
  outline: 0;
  resize: vertical;
  transition: border-color 140ms ease;

  &:focus {
    border-color: #a855f7;
    background: var(--surface);
  }
`

export const ExamplesRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const ExamplesLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--foreground-subtle);
`

export const ChipsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const Chip = styled.button`
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-raised);
  color: var(--foreground-muted);
  font: inherit;
  font-size: 11px;
  padding: 3px 10px;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    border-color: #a855f7;
    color: var(--foreground);
    background: rgba(168, 85, 247, 0.08);
  }
`

export const OfflineNotice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
  color: var(--foreground);
  font-size: 11px;
  line-height: 1.5;

  code {
    font-family: 'JetBrains Mono Variable', monospace;
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    color: #f87171;
  }
`

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
`

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: var(--foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

export const SqlPreview = styled.pre`
  margin: 0;
  padding: 12px;
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #58a6ff;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
`

export const ExplanationBox = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: var(--foreground);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
`

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: var(--surface-raised);
`

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const OutlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
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

export const PrimaryButton = styled.button<{ $loading?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid #9333ea;
  border-radius: 6px;
  background: #9333ea;
  color: #fff;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  opacity: ${({ $loading }) => ($loading ? 0.8 : 1)};
  transition: all 120ms ease;

  &:hover:not(:disabled) {
    background: #7e22ce;
  }

  .spinner {
    animation: ${spin} 1s linear infinite;
  }
`

export const InsertButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--brand);
  border-radius: 6px;
  background: var(--brand);
  color: #1b100d;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    filter: brightness(1.08);
  }
`

