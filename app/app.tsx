import { WindowFrame } from './shell'
import { GlobalStyles } from './styles/global-styles'
import { Workspace } from './components/workspace'

export default function App() {
  return (
    <>
      <GlobalStyles />
      <WindowFrame title="SQL Editor">
        <Workspace />
      </WindowFrame>
    </>
  )
}
