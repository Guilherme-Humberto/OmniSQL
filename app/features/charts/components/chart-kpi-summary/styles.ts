import styled from 'styled-components'

export const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface);
  font-size: 11px;
  color: var(--foreground-muted);
  overflow-x: auto;
`

export const StatPill = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  strong {
    color: var(--foreground);
    font-weight: 600;
    font-family: 'JetBrains Mono Variable', monospace;
  }
`

