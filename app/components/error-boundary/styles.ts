import styled from 'styled-components'

export const EXTERNAL = /node_modules|node:internal|chrome-extension:|\/electron\/js2c\//

export const Screen = styled.div`
  height: 100%;
  overflow: auto;
  background: var(--background);
  color: var(--foreground);
`

export const Inner = styled.div`
  width: min(100%, 768px);
  margin: 0 auto;
  padding: 40px 32px;
`

export const ErrorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`

export const ErrorSummary = styled.div`
  min-width: 0;
  flex: 1;
`

export const Eyebrow = styled.span`
  color: var(--brand);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 11px;
  text-transform: uppercase;
`

export const CodeBadge = styled.span`
  margin-left: 8px;
  padding: 2px 8px;
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  color: var(--brand);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 11px;
`

export const Message = styled.h1`
  margin: 6px 0 0;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
  overflow-wrap: anywhere;
`

export const ErrorMeta = styled.p`
  margin: 4px 0 0;
  color: var(--foreground-muted);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
`

export const ErrorIcon = styled.span`
  display: flex;
  width: 36px;
  height: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brand-soft);
  border-radius: 9px;
  background: var(--brand-soft);
  color: var(--brand);
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`

export const ActionButton = styled.button`
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

export const ActionSpacer = styled.div`
  flex: 1;
`

export const TabList = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 24px;
  border-bottom: 1px solid var(--border);
`

export const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 10px;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  background: transparent;
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 13px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`

export const StackPanel = styled.div`
  max-height: 52vh;
  margin-top: 10px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
`

export const StackContent = styled.pre`
  margin: 0;
  padding: 14px;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
  line-height: 1.7;
  user-select: text;
`

export const StackLine = styled.div<{ $external: boolean }>`
  overflow-wrap: anywhere;
  color: ${({ $external }) => ($external ? 'var(--foreground-muted)' : 'inherit')};
  opacity: ${({ $external }) => ($external ? 0.5 : 1)};
`

