import { cn } from '@/lib/utils'
import type { Measurement } from '@/types'

interface Props {
  latest: Measurement
  prev: Measurement
}

type Row = { label: string; prev: number; latest: number; unit: string; lowerIsBetter?: boolean }

function fmt(n: number) {
  return n === 0 ? '—' : String(n)
}

export function ProgressTable({ latest, prev }: Props) {
  const rows: Row[] = [
    { label: 'Peso', prev: prev.peso, latest: latest.peso, unit: 'kg' },
    { label: 'IMC', prev: prev.imc, latest: latest.imc, unit: '' },
    { label: 'Grasa báscula', prev: prev.grasa_pct_bascula, latest: latest.grasa_pct_bascula, unit: '%' },
    { label: 'Grasa kg', prev: prev.grasa_kg, latest: latest.grasa_kg, unit: 'kg' },
    { label: 'Músculo %', prev: prev.musculo_pct, latest: latest.musculo_pct, unit: '%', lowerIsBetter: false },
    { label: 'Cintura', prev: prev.c_cintura, latest: latest.c_cintura, unit: 'cm' },
    { label: 'Abdominal', prev: prev.c_abdominal, latest: latest.c_abdominal, unit: 'cm' },
    { label: 'Grasa 4 pliegues', prev: prev.grasa_4pliegues_pct, latest: latest.grasa_4pliegues_pct, unit: '%' },
    { label: 'Grasa kg (pliegues)', prev: prev.grasa_4pliegues_kg, latest: latest.grasa_4pliegues_kg, unit: 'kg' },
  ]

  const prevDate = new Date(prev.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  const latestDate = new Date(latest.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm">
      <h2 className="text-base font-semibold text-foreground mb-3">Comparativa</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="text-left py-1.5 font-medium">Métrica</th>
              <th className="text-right py-1.5 font-medium">{prevDate}</th>
              <th className="text-right py-1.5 font-medium">{latestDate}</th>
              <th className="text-right py-1.5 font-medium">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              if (row.prev === 0 && row.latest === 0) return null
              const diff = +(row.latest - row.prev).toFixed(2)
              const improved = row.lowerIsBetter === false ? diff > 0 : diff < 0
              const neutral = diff === 0
              return (
                <tr key={row.label} className="border-t border-border/50">
                  <td className="py-2 text-foreground">{row.label}</td>
                  <td className="py-2 text-right text-muted-foreground">{fmt(row.prev)}{row.unit}</td>
                  <td className="py-2 text-right font-medium text-foreground">{fmt(row.latest)}{row.unit}</td>
                  <td className={cn(
                    'py-2 text-right text-xs font-semibold',
                    neutral ? 'text-muted-foreground' : improved ? 'text-emerald-600' : 'text-rose-500'
                  )}>
                    {diff > 0 ? '+' : ''}{diff}{row.unit}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
