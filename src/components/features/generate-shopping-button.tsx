'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

export function GenerateShoppingButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleGenerate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekly_plan_id: planId }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al generar la lista')
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
        <ShoppingCart className="size-4" />
        {loading ? 'Generando lista...' : 'Generar lista con IA'}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  )
}
