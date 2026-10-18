import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { MENUS } from './menu'

const appear = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`

const MenuRegion = styled.div`
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
`

const MenuEntry = styled.div`
  position: relative;
`

const MenuTrigger = styled.button<{ $active: boolean }>`
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? 'var(--accent)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--foreground)' : 'var(--foreground-muted)')};
  font: inherit;
  font-size: 13px;
  cursor: default;

  &:hover {
    background: var(--accent);
    color: var(--foreground);
  }
`

const MenuPanel = styled.div`
  position: absolute;
  z-index: 50;
  top: calc(100% + 4px);
  left: 0;
  min-width: 240px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--foreground);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  animation: ${appear} 120ms ease-out;
`

const MenuSeparator = styled.div`
  height: 1px;
  margin: 4px 0;
  background: var(--border);
`

const MenuItem = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 6px 10px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  cursor: default;

  &:hover {
    background: var(--accent);
  }
`

const Shortcut = styled.span`
  color: var(--foreground-muted);
  font-size: 12px;
`

export function TitlebarMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape while open.
  useEffect(() => {
    if (openIndex === null) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenIndex(null)
    }
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpenIndex(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [openIndex])

  return (
    <MenuRegion ref={ref}>
      {MENUS.map((menu, i) => (
        <MenuEntry key={menu.label}>
          <MenuTrigger
            type="button"
            aria-expanded={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            onMouseEnter={() => openIndex !== null && setOpenIndex(i)}
            $active={openIndex === i}
          >
            {menu.label}
          </MenuTrigger>
          {openIndex === i && (
            <MenuPanel>
              {menu.items.map((item, j) =>
                item.separator ? (
                  <MenuSeparator key={j} />
                ) : (
                  <MenuItem
                    key={j}
                    type="button"
                    onClick={() => {
                      item.action?.()
                      setOpenIndex(null)
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <Shortcut>{item.shortcut}</Shortcut>}
                  </MenuItem>
                )
              )}
            </MenuPanel>
          )}
        </MenuEntry>
      ))}
    </MenuRegion>
  )
}
