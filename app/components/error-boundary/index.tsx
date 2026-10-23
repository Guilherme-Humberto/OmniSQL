import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import { Check, Copy, RotateCw, TriangleAlert } from 'lucide-react'
import {
  EXTERNAL,
  Screen,
  Inner,
  ErrorHeader,
  ErrorSummary,
  Eyebrow,
  CodeBadge,
  Message,
  ErrorMeta,
  ErrorIcon,
  Actions,
  ActionButton,
  ActionSpacer,
  TabList,
  TabButton,
  StackPanel,
  StackContent,
  StackLine,
} from './styles'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error?: Error
  componentStack?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
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

interface ErrorScreenProps {
  error: Error
  componentStack?: string
  onRetry: () => void
}

function ErrorScreen({ error, componentStack, onRetry }: ErrorScreenProps) {
  const [tab, setTab] = useState<'stack' | 'component'>('stack')
  const code = 'code' in error ? String(error.code) : undefined
  const stack = error.stack || ''

  return (
    <Screen>
      <Inner>
        <ErrorHeader>
          <ErrorIcon>
            <TriangleAlert size={20} />
          </ErrorIcon>
          <ErrorSummary>
            <div>
              <Eyebrow>{error.name || 'Error'}</Eyebrow>
              {code && <CodeBadge>{code}</CodeBadge>}
            </div>
            <Message>{error.message || 'An unexpected error occurred'}</Message>
            <ErrorMeta>Um erro não tratado interrompeu a renderização.</ErrorMeta>
          </ErrorSummary>
        </ErrorHeader>

        <Actions>
          <ActionButton type="button" onClick={onRetry}>
            <RotateCw size={14} />
            Tentar novamente
          </ActionButton>
          <ActionSpacer />
          <CopyButton value={`${error.name}: ${error.message}\n\n${stack}\n\n${componentStack || ''}`} />
        </Actions>

        <TabList>
          <TabButton
            type="button"
            $active={tab === 'stack'}
            onClick={() => setTab('stack')}
            disabled={!stack}
          >
            Stack Trace
          </TabButton>
          <TabButton
            type="button"
            $active={tab === 'component'}
            onClick={() => setTab('component')}
            disabled={!componentStack}
          >
            Component Stack
          </TabButton>
        </TabList>

        <Frames text={tab === 'stack' ? stack : componentStack || ''} />
      </Inner>
    </Screen>
  )
}

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
      {copied ? 'Copiado' : 'Copiar relatório'}
    </ActionButton>
  )
}

