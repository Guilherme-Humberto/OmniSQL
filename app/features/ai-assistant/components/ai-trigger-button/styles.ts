import styled from 'styled-components'

export const TriggerButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  transition: all 140ms ease;
  user-select: none;

  &:hover {
    background: rgba(168, 85, 247, 0.22);
    border-color: rgba(168, 85, 247, 0.6);
    color: #e9d5ff;
    transform: translateY(-0.5px);
  }

  &:active {
    transform: translateY(0);
  }
`

