import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  animation: fadeIn 120ms ease-out;
`

export const ModalBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 820px;
  height: 82vh;
  max-height: 720px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
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
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
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

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

export const TargetBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  overflow-x: auto;
`

export const TargetPill = styled.button<{ $active: boolean; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid ${({ $active, $color }) => ($active ? $color : 'var(--border)')};
  background: ${({ $active }) => ($active ? 'var(--surface-raised)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? '650' : '500')};
  cursor: pointer;
  white-space: nowrap;
  transition: all 120ms ease;

  &:hover {
    border-color: ${({ $color }) => $color};
    color: var(--foreground);
  }
`

export const TargetBadge = styled.span<{ $color: string }>`
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  font-weight: 700;
`

export const CodeBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  background: var(--background);
`

export const CodeScroll = styled.pre`
  margin: 0;
  padding: 16px 20px;
  flex: 1;
  overflow: auto;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--foreground);
  background: var(--background);
  user-select: text;
  white-space: pre;
`

export const ModalFooter = styled.footer`
  display: flex;
  height: 48px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-top: 1px solid var(--border);
  background: var(--surface);
`

export const FooterOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  color: var(--foreground-muted);
`

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;

  input {
    accent-color: var(--brand);
    cursor: pointer;
  }
`

export const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-raised);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--accent);
    border-color: var(--foreground-muted);
  }
`

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--brand);
  border-radius: 6px;
  background: var(--brand);
  color: #1b100d;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 120ms ease;

  &:hover {
    filter: brightness(1.08);
  }
`

