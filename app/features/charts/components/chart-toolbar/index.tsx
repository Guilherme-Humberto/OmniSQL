import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'
import { ChartType } from '../../domain/types'
import {
  Toolbar,
  Toolgroup,
  TypeButtonGroup,
  TypeButton,
  SelectWrapper,
  Select,
} from './styles'

interface ChartToolbarProps {
  chartType: ChartType
  columns: string[]
  xAxisCol: string
  yAxisCol: string
  onTypeChange: (type: ChartType) => void
  onXAxisChange: (col: string) => void
  onYAxisChange: (col: string) => void
}

export function ChartToolbar({
  chartType,
  columns,
  xAxisCol,
  yAxisCol,
  onTypeChange,
  onXAxisChange,
  onYAxisChange,
}: ChartToolbarProps) {
  return (
    <Toolbar>
      <Toolgroup>
        <TypeButtonGroup>
          <TypeButton $active={chartType === ChartType.Bar} onClick={() => onTypeChange(ChartType.Bar)}>
            <BarChart3 size={13} />
            <span>Barras</span>
          </TypeButton>
          <TypeButton $active={chartType === ChartType.Line} onClick={() => onTypeChange(ChartType.Line)}>
            <LineChartIcon size={13} />
            <span>Linhas</span>
          </TypeButton>
          <TypeButton $active={chartType === ChartType.Pie} onClick={() => onTypeChange(ChartType.Pie)}>
            <PieChartIcon size={13} />
            <span>Pizza</span>
          </TypeButton>
        </TypeButtonGroup>
      </Toolgroup>

      <Toolgroup>
        <SelectWrapper>
          <span>Eixo X:</span>
          <Select value={xAxisCol} onChange={(e) => onXAxisChange(e.target.value)}>
            {columns.map((c) => (
              <option key={`x-${c}`} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        <SelectWrapper>
          <span>Métrica (Y):</span>
          <Select value={yAxisCol} onChange={(e) => onYAxisChange(e.target.value)}>
            {columns.map((c) => (
              <option key={`y-${c}`} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </SelectWrapper>
      </Toolgroup>
    </Toolbar>
  )
}
