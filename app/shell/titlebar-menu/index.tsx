import { useEffect, useRef, useState } from 'react'
import { MENUS } from '../menu'
import {
  MenuRegion,
  MenuEntry,
  MenuTrigger,
  MenuPanel,
  MenuSeparator,
  MenuItem,
  Shortcut,
} from './styles'

export function TitlebarMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha o menu ao clicar fora ou ao pressionar Escape
  useEffect(() => {
    if (openIndex === null) return

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpenIndex(null)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [openIndex])

  return (
    <MenuRegion ref={ref}>
      {MENUS.map((menu, i) => {
        const isOpen = openIndex === i
        return (
          <MenuEntry key={menu.label}>
            <MenuTrigger
              type="button"
              $active={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              onMouseEnter={() => {
                if (openIndex !== null && openIndex !== i) setOpenIndex(i)
              }}
            >
              {menu.label}
            </MenuTrigger>

            {isOpen && (
              <MenuPanel role="menu">
                {menu.items.map((item, j) => {
                  if (item.separator) {
                    return <MenuSeparator key={j} />
                  }

                  return (
                    <MenuItem
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenIndex(null)
                        item.action?.()
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <Shortcut>{item.shortcut}</Shortcut>}
                    </MenuItem>
                  )
                })}
              </MenuPanel>
            )}
          </MenuEntry>
        )
      })}
    </MenuRegion>
  )
}
