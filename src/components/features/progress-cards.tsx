import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Measurement } from '@/types'

interface Props {
  latest: Measurement
  prev: Measurement | null
}

interface MetricCardProps {
  label: string
  value: number
  unit: string
  prev?: number
  lowerIsBetter?: boolean
}

function delta(current: number, previous: number) {
  return +(current - previous).toFixed(2)
}

function MetricCard({ label, value, unit, prev, lowerIsBetter = true }: MetricCardProps) {
  const diff = prev != null ? delta(value, prev) : null
  const improved = diff != null ? (lowerIsBetter ? diff < 0 : diff > 0) : null
  const neutral = diff === 0

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>
      </div>
      {diff != null && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          neutral ? 'text-muted-foreground' : improved ? 'text-emerald-600' : 'text-rose-500'
        )}>
          {neutral ? (
            <Minus className="size-3" />
          ) : improved ? (
            <TrendingDown className="size-3" />
          ) : (
            <TrendingUp className="size-3" />
          )}
          {diff > 0 ? '+' : ''}{diff} {unit}
        </div>
      )}
    </div>
  )
}

export function ProgressCards({ latest, prev }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Peso" value={latest.peso} unit="kg" prev={prev?.peso} />
      <MetricCard label="IMC" value={latest.imc} unit="" prev={prev?.imc} />
      <MetricCard label="Grasa (báscula)" value={latest.grasa_pct_bascula} unit="%" prev={prev?.grasa_pct_bascula} />
      <MetricCard label="Músculo" value={latest.musculo_pct} unit="%" prev={prev?.musculo_pct} lowerIsBetter={false} />
      <MetricCard label="Cintura" value={latest.c_cintura} unit="cm" prev={prev?.c_cintura} />
      <MetricCard label="Abdominal" value={latest.c_abdominal} unit="cm" prev={prev?.c_abdominal} />
      <MetricCard label="Grasa 4 pliegues" value={latest.grasa_4pliegues_pct} unit="%" prev={prev?.grasa_4pliegues_pct} />
      <MetricCard label="Grasa kg (pliegues)" value={latest.grasa_4pliegues_kg} unit="kg" prev={prev?.grasa_4pliegues_kg} />
    </div>
  )
}
