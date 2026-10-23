import { useEffect, useState } from 'react'

/**
 * Hook para detectar se o usuário está segurando a tecla modificadora
 * (Ctrl no Windows/Linux, Cmd/Meta no macOS) para ativar a navegação de Chaves Estrangeiras.
 */
export function useModifierKey(): boolean {
  const [isModifierActive, setIsModifierActive] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsModifierActive(true)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsModifierActive(false)
      }
    }

    const onBlur = () => {
      setIsModifierActive(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return isModifierActive
}

