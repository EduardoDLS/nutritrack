import { createClient } from '@/lib/supabase/server'
import type { Measurement } from '@/types'
import { ProgressCards } from '@/components/features/progress-cards'
import { ProgressChart } from '@/components/features/progress-chart'
import { ProgressTable } from '@/components/features/progress-table'

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('measurements')
    .select('*')
    .order('fecha', { ascending: true })

  const measurements = (data ?? []) as Measurement[]
  const latest = measurements[measurements.length - 1] ?? null
  const prev = measurements[measurements.length - 2] ?? null

  if (!measurements.length) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-muted-foreground">Sin mediciones aún.</p>
        <p className="text-sm text-muted-foreground mt-1">Sube tu PDF del nutriólogo desde Perfil.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground pt-2">Progreso</h1>
      <ProgressCards latest={latest} prev={prev} />
      <ProgressChart measurements={measurements} />
      {prev && <ProgressTable latest={latest} prev={prev} />}
    </div>
  )
}
