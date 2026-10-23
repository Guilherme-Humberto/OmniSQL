import styled from 'styled-components'

export const Frame = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: var(--background);
  color: var(--foreground);
`

export const Content = styled.main`
  min-height: 0;
  flex: 1;
  overflow: hidden;
`

