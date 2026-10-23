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
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: var(--foreground-muted);
`

export const Input = styled.input`
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface-raised);
  color: var(--foreground);
  font: inherit;
  font-size: 12px;
  outline: 0;
  transition: border-color 140ms ease;

  &:focus {
    border-color: var(--brand);
    background: var(--surface);
  }
`

export const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

export const ColorDot = styled.button<{ $colorHex: string; $selected: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? 'var(--foreground)' : 'transparent')};
  background-color: ${({ $colorHex }) => $colorHex};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease;

  &:hover {
    transform: scale(1.15);
  }
`

export const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  cursor: pointer;
  user-select: none;
`

export const ToggleLabelGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 550;
`

export const Switch = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 36px;
  height: 20px;
  border-radius: 20px;
  background: var(--border);
  position: relative;
  outline: 0;
  cursor: pointer;
  transition: background 140ms ease;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 140ms ease;
  }

  &:checked {
    background: var(--brand);
  }

  &:checked::before {
    transform: translateX(16px);
  }
`

export const SecurityDescription = styled.div`
  font-size: 10px;
  color: var(--foreground-muted);
`

