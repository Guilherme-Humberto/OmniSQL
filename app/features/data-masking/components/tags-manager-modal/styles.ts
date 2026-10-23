import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  animation: fadeIn 120ms ease-out;
`

export const ModalBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 780px;
  height: 80vh;
  max-height: 680px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
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

export const TitleGroup = styled.div`
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

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground-muted);
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
  }
`

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  gap: 16px;
`

export const DescriptionText = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--foreground-muted);
  line-height: 1.5;
`

export const CategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-raised);
  gap: 10px;
`

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const CategoryTitle = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`

export const TagChip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid ${({ $color }) => $color};
  color: var(--foreground);
  font-size: 11px;
  font-family: var(--font-mono);
`

export const TagRemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--foreground-muted);
  cursor: pointer;
  border-radius: 3px;
  transition: color 120ms ease;

  &:hover {
    color: #ef4444;
  }
`

export const AddTagForm = styled.form`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

export const AddTagInput = styled.input`
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font-size: 11px;
  font-family: var(--font-mono);
  outline: none;
  width: 130px;

  &:focus {
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--foreground-muted);
  }
`

export const AddTagButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
    border-color: var(--border-strong);
  }
`

export const ModalFooter = styled.footer`
  display: flex;
  height: 54px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-top: 1px solid var(--border);
  background: var(--surface-raised);
`

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const SecondaryButton = styled.button`
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--foreground-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    background: var(--surface-active);
    color: var(--foreground);
  }
`

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  background: var(--brand);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 120ms ease;

  &:hover {
    opacity: 0.9;
  }
`

