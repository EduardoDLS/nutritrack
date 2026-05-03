import { createClient } from '@/lib/supabase/server'
import type { Measurement } from '@/types'
import { PdfUploader } from '@/components/features/pdf-uploader'
import { signOut } from '@/lib/actions'

export default async function ProfilePage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('measurements').select('id,fecha,peso,grasa_pct_bascula,musculo_pct').order('fecha', { ascending: false }),
  ])

  const measurements = (data ?? []) as Pick<Measurement, 'id' | 'fecha' | 'peso' | 'grasa_pct_bascula' | 'musculo_pct'>[]

  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? 'Eduardo'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm text-muted-foreground hover:text-destructive transition-colors">
            Cerrar sesión
          </button>
        </form>
      </div>

      <div className="bg-card rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-xl">{displayName[0].toUpperCase()}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Team Pantera — L.N. Miguel Oropeza</p>
        </div>
      </div>

      <PdfUploader />

      {measurements.length > 0 && (
        <div className="bg-card rounded-3xl p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-3">Historial de mediciones</h2>
          <div className="space-y-2">
            {measurements.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium text-foreground">
                  {new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{m.peso} kg</span>
                  <span>{m.grasa_pct_bascula}% grasa</span>
                  <span>{m.musculo_pct}% músculo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
