import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import styled from 'styled-components'
import { Check, Copy, RotateCw, TriangleAlert } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error?: Error
  /** React's own component stack for the throw. Only a boundary can see it, so never drop it. */
  componentStack?: string
}

// ================================================================
// BOUNDARY
// ================================================================

/**
 * Catches render-phase errors and shows what a developer actually needs: the error, where it was
 * thrown, and which component threw it. Pass `fallback` to replace the whole screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Also log it: the panel is one view, but devtools is where a breakpoint or "pause on caught
    // exceptions" actually lives, and console preserves the live object rather than a string.
    console.error('[error-boundary]', error, info.componentStack)
    this.setState({ componentStack: info.componentStack ?? undefined })
  }

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback
    return (
      <ErrorScreen
        error={this.state.error}
        componentStack={this.state.componentStack}
        onRetry={() => this.setState({ error: undefined, componentStack: undefined })}
      />
    )
  }
}

// ================================================================
// SCREEN
// ================================================================

function ErrorScreen({
  error,
  componentStack,
  onRetry,
}: {
  error: Error
  componentStack?: string
  onRetry: () => void
}) {
  const [activeTab, setActiveTab] = useState<'stack' | 'components'>('stack')

  // Errors carrying a `code` (conveyor's, and most typed error classes) tell you far more than the
  // message does. Read it structurally rather than importing the class, so any of them work.
  const code =
    typeof (error as { code?: unknown }).code === 'string' ? (error as unknown as { code: string }).code : null

  const report = [
    `${error.name}: ${error.message}`,
    code ? `code: ${code}` : '',
    error.stack ? `\n${error.stack}` : '',
    componentStack ? `\ncomponent stack:${componentStack}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <Screen>
      <Inner>
        <ErrorHeader>
          <ErrorSummary>
            <Eyebrow>Runtime error</Eyebrow>
            {code && <CodeBadge>{code}</CodeBadge>}
            <Message>{error.message || 'No message was attached to this error.'}</Message>
            <ErrorMeta>{error.name}, thrown during render</ErrorMeta>
          </ErrorSummary>
          <ErrorIcon>
            <TriangleAlert size={18} />
          </ErrorIcon>
        </ErrorHeader>

        <Actions>
          <ActionButton type="button" onClick={onRetry}>
            <RotateCw size={14} /> Try again
          </ActionButton>
          <ActionButton type="button" onClick={() => window.location.reload()}>
            Reload window
          </ActionButton>
          <ActionSpacer />
          <CopyButton value={report} />
        </Actions>

        <TabList role="tablist">
          <TabButton
            type="button"
            role="tab"
            aria-selected={activeTab === 'stack'}
            $active={activeTab === 'stack'}
            onClick={() => setActiveTab('stack')}
          >
            Stack
          </TabButton>
          <TabButton
            type="button"
            role="tab"
            aria-selected={activeTab === 'components'}
            disabled={!componentStack}
            $active={activeTab === 'components'}
            onClick={() => setActiveTab('components')}
          >
            Components
          </TabButton>
        </TabList>
        <Frames
          text={
            activeTab === 'stack' ? (error.stack ?? 'No stack was attached to this error.') : (componentStack ?? '')
          }
        />
      </Inner>
    </Screen>
  )
}

// ================================================================
// PARTS
// ================================================================

// Anything from a dependency or the runtime itself. Almost never where the bug is, so it recedes
// and lets your own frames carry the eye.
const EXTERNAL = /node_modules|node:internal|chrome-extension:|\/electron\/js2c\//

const Screen = styled.div`
  height: 100%;
  overflow: auto;
  background: var(--background);
  color: var(--foreground);
`

const Inner = styled.div`
  width: min(100%, 768px);
  margin: 0 auto;
  padding: 40px 32px;
`

const ErrorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`

const ErrorSummary = styled.div`
  min-width: 0;
  flex: 1;
`

const Eyebrow = styled.span`
  color: var(--brand);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 11px;
  text-transform: uppercase;
`

const CodeBadge = styled.span`
  margin-left: 8px;
  padding: 2px 8px;
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  color: var(--brand);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 11px;
`

const Message = styled.h1`
  margin: 6px 0 0;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
  overflow-wrap: anywhere;
`

const ErrorMeta = styled.p`
  margin: 4px 0 0;
  color: var(--foreground-muted);
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
`

const ErrorIcon = styled.span`
  display: flex;
  width: 36px;
  height: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brand-soft);
  border-radius: 9px;
  background: var(--brand-soft);
  color: var(--brand);
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`

const ActionButton = styled.button`
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--foreground);
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: var(--accent);
  }
`

const ActionSpacer = styled.div`
  flex: 1;
`

const TabList = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 24px;
  border-bottom: 1px solid var(--border);
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 10px;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--brand)' : 'transparent')};
  background: transparent;
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 13px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`

const StackPanel = styled.div`
  max-height: 52vh;
  margin-top: 10px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
`

const StackContent = styled.pre`
  margin: 0;
  padding: 14px;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
  line-height: 1.7;
  user-select: text;
`

const StackLine = styled.div<{ $external: boolean }>`
  overflow-wrap: anywhere;
  color: ${({ $external }) => ($external ? 'var(--foreground-muted)' : 'inherit')};
  opacity: ${({ $external }) => ($external ? 0.5 : 1)};
`

/**
 * A stack rendered line by line, with dependency and runtime frames dimmed. Capped rather than
 * stretched: filling the viewport left a short trace floating in a mostly empty box.
 */
function Frames({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <StackPanel>
      <StackContent>
        {lines.map((line, i) => (
          <StackLine key={i} $external={EXTERNAL.test(line)}>
            {line || '\u00a0'}
          </StackLine>
        ))}
      </StackContent>
    </StackPanel>
  )
}

/** Copies the whole report: message, code, stack, and component stack in one paste. */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ActionButton type="button" onClick={copy}>
      {copied ? <Check size={14} color="var(--success, #16a34a)" /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy report'}
    </ActionButton>
  )
}
