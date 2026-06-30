'use client'

import { useState } from 'react'
import { saveLessonFile, deleteLessonFile, deleteFromStorage } from '@/lib/upload/actions'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const BUCKETS: Record<string, string> = {
  audio: 'audio',
  pdf: 'pdfs',
  video: 'videos',
}

const ACCEPT: Record<string, string> = {
  audio: '.m4a,.mp3,.wav,.ogg,.aac,.flac,audio/*',
  pdf: '.pdf',
  video: '.mp4,.webm,.mov, video/*',
}

const LABELS: Record<string, string> = {
  audio: 'Audio',
  pdf: 'PDF',
  video: 'Video',
}

function getAuthCookieValue(name: string): string | null {
  const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)
  return match ? match[2] : null
}

function getAccessToken(): string | null {
  const cookiePrefix = 'sb-fopeiowtwobxbwgugnml-auth-token'
  const raw = getAuthCookieValue(cookiePrefix)
  if (!raw) return null
  try {
    const session = JSON.parse(decodeURIComponent(raw))
    return session.access_token ?? null
  } catch {
    return null
  }
}

export default function FileUploader({
  lessonId,
  fileType,
  currentUrl,
}: {
  lessonId: number
  fileType: 'audio' | 'pdf' | 'video'
  currentUrl: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(currentUrl)

  const bucket = BUCKETS[fileType]
  const accept = ACCEPT[fileType]
  const label = LABELS[fileType]

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const token = getAccessToken()
      if (!token) throw new Error('No autenticado')

      const path = `${lessonId}/${Date.now()}-${file.name}`
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
        {
          method: 'POST',
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': file.type,
          },
          body: file,
        },
      )

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || 'Error al subir archivo')
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
      const result = await saveLessonFile(lessonId, fileType, publicUrl)
      if (result.error) throw new Error(result.error)

      setUrl(publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!url) return
    setUploading(true)
    setError(null)

    try {
      const path = url.split(`/storage/v1/object/public/${bucket}/`)[1]
      if (path) {
        await deleteFromStorage(bucket, path)
      }
      const result = await deleteLessonFile(lessonId, fileType)
      if (result.error) throw new Error(result.error)
      setUrl(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar archivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{label}</h3>

      {url ? (
        <div className="flex items-center gap-3">
          {fileType === 'audio' && (
            <audio controls className="h-10 flex-1">
              <source src={url} />
            </audio>
          )}
          {fileType === 'video' && (
            <video controls className="h-24 flex-1 rounded">
              <source src={url} />
            </video>
          )}
          {fileType === 'pdf' && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Ver PDF
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            {uploading ? '...' : 'Eliminar'}
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-500">
          {uploading ? 'Subiendo...' : `Subir ${label}`}
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
