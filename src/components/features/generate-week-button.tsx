'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function GenerateWeekButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleGenerate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/generate-plan', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al generar el plan')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base gap-2 hover:bg-primary/90"
      >
        <Sparkles className="size-4" />
        {loading ? 'Generando semana...' : 'Generar semana con IA'}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  )
}
