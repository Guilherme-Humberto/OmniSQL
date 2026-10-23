import styled from 'styled-components'

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--foreground-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Subtitle = styled.span`
  font-size: 10px;
  text-transform: none;
  color: var(--foreground-subtle);
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

export const Card = styled.button<{ $selected: boolean; $brandColor: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px;
  border-radius: 8px;
  border: 2px solid ${({ $selected, $brandColor }) => ($selected ? $brandColor : 'var(--border)')};
  background: ${({ $selected }) => ($selected ? 'var(--surface-raised)' : 'var(--surface)')};
  cursor: pointer;
  text-align: left;
  transition: all 140ms ease;

  &:hover {
    border-color: ${({ $selected, $brandColor }) => ($selected ? $brandColor : 'var(--foreground-muted)')};
    transform: translateY(-1px);
  }
`

export const HeaderRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`

export const IconCircle = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $color }) => $color}18;
  color: ${({ $color }) => $color};
`

export const StateBadge = styled.span<{ $ready: boolean }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${({ $ready }) => ($ready ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 158, 11, 0.15)')};
  color: ${({ $ready }) => ($ready ? 'var(--success)' : '#f59e0b')};
  border: 1px solid ${({ $ready }) => ($ready ? 'rgba(74, 222, 128, 0.3)' : 'rgba(245, 158, 11, 0.3)')};
`

export const DriverName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--foreground);
`

export const DriverDesc = styled.div`
  font-size: 10px;
  color: var(--foreground-muted);
  line-height: 1.4;
`
