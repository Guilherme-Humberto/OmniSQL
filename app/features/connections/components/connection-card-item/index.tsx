import { Trash2 } from 'lucide-react'
import type { ConnectionProfile } from '@/conveyor/connection-contracts'
import { COLOR_MAP } from '../../constants'
import {
  ItemContainer,
  ItemContent,
  ItemTitleRow,
  ItemName,
  ItemSub,
  DriverTag,
  ItemActions,
  ActionButton,
} from './styles'

interface ConnectionCardItemProps {
  profile: ConnectionProfile
  isSelected: boolean
  subtitle: string
  onSelect: () => void
  onDoubleClick: () => void
  onDelete?: () => void
}

export function ConnectionCardItem({
  profile,
  isSelected,
  subtitle,
  onSelect,
  onDoubleClick,
  onDelete,
}: ConnectionCardItemProps) {
  const colorInfo = COLOR_MAP[profile.color] || COLOR_MAP.orange

  return (
    <ItemContainer
      $active={isSelected}
      $colorHex={colorInfo.hex}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <ItemContent>
        <ItemTitleRow>
          <ItemName $active={isSelected}>{profile.name}</ItemName>
          <DriverTag $driver={profile.config.driver}>{profile.config.driver}</DriverTag>
        </ItemTitleRow>
        <ItemSub>{subtitle}</ItemSub>
      </ItemContent>

      {onDelete && (
        <ItemActions className="item-actions">
          <ActionButton
            type="button"
            title="Excluir perfil salvo"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 size={12} />
          </ActionButton>
        </ItemActions>
      )}
    </ItemContainer>
  )
}

