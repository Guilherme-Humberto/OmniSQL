import styled from 'styled-components'

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
`

export const ModalBox = styled.div`
  width: 100%;
  max-width: 520px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
`

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
`

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

export const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

  &:focus {
    border-color: var(--brand);
    background: var(--surface);
  }
`

export const ErrorMessage = styled.div`
  font-size: 11px;
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 5px;
`

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background: var(--surface-raised);
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

  &:hover {
    background: var(--accent);
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

  &:hover {
    filter: brightness(1.08);
  }
`

export const Description = styled.div`
  font-size: 11px;
  color: var(--foreground-muted);
  line-height: 1.5;
`

