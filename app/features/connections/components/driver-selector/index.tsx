import { Database } from 'lucide-react'
import type { ConnectionDriver } from '@/conveyor/connection-contracts'
import { DRIVER_CATALOG } from '../../constants'
import {
  Section,
  SectionTitle,
  Subtitle,
  Grid,
  Card,
  HeaderRow,
  IconCircle,
  StateBadge,
  DriverName,
  DriverDesc,
} from './styles'

interface DriverSelectorProps {
  selectedDriver: ConnectionDriver
  onSelect: (driver: ConnectionDriver) => void
}

export function DriverSelector({ selectedDriver, onSelect }: DriverSelectorProps) {
  return (
    <Section>
      <SectionTitle>
        <span>Tipo de Conexão</span>
        <Subtitle>Selecione o motor de banco de dados</Subtitle>
      </SectionTitle>

      <Grid>
        {DRIVER_CATALOG.map((driver) => {
          const isSelected = selectedDriver === driver.id
          return (
            <Card
              key={driver.id}
              type="button"
              $selected={isSelected}
              $brandColor={driver.color}
              onClick={() => onSelect(driver.id)}
            >
              <HeaderRow>
                <IconCircle $color={driver.color}>
                  <Database size={16} />
                </IconCircle>
                <StateBadge $ready={driver.isReady}>{driver.badge}</StateBadge>
              </HeaderRow>

              <div>
                <DriverName>{driver.name}</DriverName>
                <DriverDesc>{driver.engine}</DriverDesc>
              </div>
            </Card>
          )
        })}
      </Grid>
    </Section>
  )
}
