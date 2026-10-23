import { AppView } from './constants/app-constants'
import { WindowFrame } from './shell'
import { GlobalStyles } from './styles/global-styles'
import { Workspace } from './components/workspace'
import { ConnectionManager } from './components/connection-manager'
import { useWorkspaceStore } from './components/workspace-store'

export default function App() {
  const currentView = useWorkspaceStore((state) => state.currentView)

  return (
    <>
      <GlobalStyles />
      <WindowFrame title="SQL Editor">
        {currentView === AppView.Connections ? <ConnectionManager /> : <Workspace />}
      </WindowFrame>
    </>
  )
}
