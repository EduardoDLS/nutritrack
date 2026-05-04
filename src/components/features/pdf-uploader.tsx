'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function PdfUploader() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function upload(file: File) {
    if (!file.name.endsWith('.pdf')) {
      setMessage('Solo se aceptan archivos PDF.')
      setStatus('error')
      return
    }
    setFileName(file.name)
    setStatus('loading')
    setMessage('')

    const form = new FormData()
    form.append('pdf', file)

    const res = await fetch('/api/extract-pdf', { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setMessage(data.error ?? 'Error al procesar el PDF')
    } else {
      if (data.saved?.menu) {
        setMessage('Menú extraído, generando plan semanal y lista del super...')
        const planRes = await fetch('/api/generate-plan', { method: 'POST' })
        if (!planRes.ok) {
          const planData = await planRes.json()
          setStatus('error')
          setMessage(planData.error ?? 'Menú guardado pero no se pudo generar el plan')
          return
        }
      }
      const parts = []
      if (data.saved?.menu) parts.push('menú, plan semanal y lista del super actualizados')
      if (data.saved?.mediciones) parts.push('mediciones guardadas')
      setStatus('success')
      setMessage(parts.length ? `Listo — ${parts.join(' y ')}.` : 'PDF procesado.')
      router.refresh()
    }
  }

  function handleFile(file: File | null) {
    if (file) upload(file)
  }

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm space-y-3">
      <h2 className="text-base font-semibold text-foreground">Subir PDF del nutriólogo</h2>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0] ?? null) }}
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
          status === 'loading' && 'pointer-events-none opacity-70'
        )}
      >
        {status === 'loading' ? (
          <Loader2 className="size-8 text-primary animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle className="size-8 text-emerald-500" />
        ) : fileName ? (
          <FileText className="size-8 text-primary" />
        ) : (
          <Upload className="size-8 text-muted-foreground" />
        )}

        <p className="text-sm font-medium text-foreground text-center">
          {status === 'loading'
            ? 'Procesando con IA...'
            : status === 'success'
            ? '¡Listo!'
            : fileName
            ? fileName
            : 'Arrastra tu PDF aquí o toca para seleccionar'}
        </p>
        <p className="text-xs text-muted-foreground">PDF del plan de L.N. Miguel Oropeza</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0] ?? null)}
      />

      {message && (
        <p className={cn('text-sm text-center', status === 'error' ? 'text-destructive' : 'text-emerald-600')}>
          {message}
        </p>
      )}

      {status === 'success' && (
        <Button
          onClick={() => { setStatus('idle'); setFileName(''); setMessage('') }}
          variant="outline"
          className="w-full rounded-full"
        >
          Subir otro PDF
        </Button>
      )}
    </div>
  )
}
