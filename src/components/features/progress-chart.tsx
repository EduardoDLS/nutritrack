'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import type { Measurement } from '@/types'

interface Props {
  measurements: Measurement[]
}

export function ProgressChart({ measurements }: Props) {
  const data = measurements.map(m => ({
    fecha: new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    Peso: m.peso,
    'Grasa %': m.grasa_pct_bascula,
    'Músculo %': m.musculo_pct,
  }))

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-foreground">Evolución</h2>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Peso (kg)</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
            <Line type="monotone" dataKey="Peso" stroke="#6d28d9" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Composición corporal (%)</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Grasa %" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Músculo %" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
