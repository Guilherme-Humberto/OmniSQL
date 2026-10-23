import styled from 'styled-components'

export const Container = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 320px minmax(0, 1fr);
  background: var(--background);
  color: var(--foreground);
  overflow: hidden;

  @media (max-width: 860px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
`

export const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--background);
`

export const MainHeader = styled.header`
  display: flex;
  height: 52px;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
`

export const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--foreground);
`

export const DraftStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  color: var(--foreground-muted);
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const OutlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 11px;
  font-weight: 550;
  cursor: pointer;
  transition: all 120ms ease;

  &:hover {
    border-color: var(--foreground-muted);
    background: var(--accent);
  }
`

export const FormScroll = styled.div`
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 820px;
`

export const FooterBar = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  border-top: 1px solid var(--border);
  background: var(--surface);
`

export const FeedbackArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  min-width: 0;
  flex: 1;
`

export const FeedbackBadge = styled.div<{ $ok?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ $ok }) => ($ok ? 'var(--success)' : 'var(--danger)')};
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 18px;
  border: 1px solid var(--brand);
  border-radius: 6px;
  background: var(--brand);
  color: #1b100d;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(255, 92, 58, 0.25);
  transition: all 140ms ease;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-0.5px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`

