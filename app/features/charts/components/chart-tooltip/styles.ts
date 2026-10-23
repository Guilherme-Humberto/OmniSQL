import styled from 'styled-components'

export const TooltipContainer = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: translate(-50%, -110%);
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  font-size: 11px;
  white-space: nowrap;

  .label {
    font-weight: 600;
    color: var(--foreground);
  }

  .value {
    color: var(--brand);
    font-family: 'JetBrains Mono Variable', monospace;
    font-weight: 600;
  }

  .percent {
    color: var(--foreground-muted);
    font-size: 10px;
  }
`

