import styled from 'styled-components'

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 260px;
  background: var(--surface);
  user-select: none;
`

export const CanvasArea = styled.div`
  position: relative;
  min-height: 0;
  flex: 1;
  padding: 16px 20px 10px 16px;
  overflow: hidden;
`

export const EmptyNotice = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--foreground-muted);
  font-size: 12px;
  gap: 8px;
`

