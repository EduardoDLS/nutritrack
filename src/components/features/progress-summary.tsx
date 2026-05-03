import type { Measurement } from '@/types'

interface Props {
  latest: Measurement | null
}

export function ProgressSummary({ latest }: Props) {
  if (!latest) return null

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm">
      <h2 className="text-base font-semibold text-foreground mb-3">Mi progreso</h2>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="text-lg font-bold text-foreground">{latest.peso}</p>
          <p className="text-xs text-muted-foreground">kg</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Grasa</p>
          <p className="text-lg font-bold text-foreground">{latest.grasa_pct_bascula}</p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Músculo</p>
          <p className="text-lg font-bold text-foreground">{latest.musculo_pct}</p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
      </div>
    </div>
  )
}
