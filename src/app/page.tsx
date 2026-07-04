
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Concept {
  id: string
  word: string
  script: string
  meaning: string
  human_experience: string
  encounter: string
  reflection_prompt: string
}

interface ExploreResult {
  concept: Concept
  bridgeText: string
  explorationId: string
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ExploreResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [sessionId] = useState(() => {
  if (typeof window === 'undefined') return 'anonymous'
  const existing = localStorage.getItem('samskritam_session')
  if (existing) return existing
  const newId = Math.random().toString(36).slice(2)
  localStorage.setItem('samskritam_session', newId)
  return newId
  
})
const router = useRouter()

  const handleExplore = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)

    try {
      const res = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: input,
          sessionId: sessionId
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
  if (!result?.explorationId) return

  // call the PATCH route to mark this exploration as saved in the db
  await fetch('/api/explore', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ explorationId: result.explorationId })
  })

  setSaved(true)
}

  const handleReset = () => {
    setResult(null)
    setInput('')
    setError('')
    setSaved(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
  <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', color: '#44403c', margin: '0 0 6px' }}>
    samskritam
  </h1>
  <p style={{ fontSize: '12px', color: '#a8a29e', letterSpacing: '0.12em', margin: '0 0 24px' }}>
    ancient words for modern moments
  </p>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
    <span style={{ fontSize: '12px', color: '#44403c', letterSpacing: '0.1em', borderBottom: '0.5px solid #44403c', paddingBottom: '2px' }}>
      explore
    </span>
    <span
      onClick={() => router.push('/moments')}
      style={{ fontSize: '12px', color: '#a8a29e', letterSpacing: '0.1em', cursor: 'pointer' }}
    >
      my moments
    </span>
  </div>
</div>

      {!result && (
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <p style={{ fontSize: '13px', color: '#a8a29e', textAlign: 'center', marginBottom: '16px' }}>
            Share a thought, a feeling, or a moment
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleExplore()
              }
            }}
            style={{ width: '100%', background: 'white', border: '0.5px solid #e7e5e4', borderRadius: '16px', padding: '20px 24px', fontSize: '14px', color: '#57534e', resize: 'none', minHeight: '120px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7 }}
          />
          <button
            onClick={handleExplore}
            disabled={loading || !input.trim()}
            style={{ marginTop: '12px', width: '100%', background: loading || !input.trim() ? '#d6d3d1' : '#44403c', color: '#f5f5f4', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '12px', letterSpacing: '0.2em', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {loading ? 'discovering...' : 'explore'}
          </button>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginTop: '12px' }}>
              {error}
            </p>
          )}
        </div>
      )}

      {result && (
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <p style={{ fontSize: '56px', fontWeight: 300, color: '#44403c', margin: '0 0 10px', lineHeight: 1 }}>
              {result.concept.script}
            </p>
            <p style={{ fontSize: '18px', letterSpacing: '0.25em', color: '#78716c', margin: '0 0 6px' }}>
              {result.concept.word}
            </p>
            <p style={{ fontSize: '13px', color: '#a8a29e', fontStyle: 'italic', margin: 0 }}>
              {result.concept.meaning}
            </p>
          </div>

          <div style={{ width: '40px', height: '0.5px', background: '#d6d3d1', margin: '0 auto 28px' }} />

          <p style={{ fontSize: '15px', color: '#57534e', lineHeight: 1.8, textAlign: 'center', marginBottom: '28px' }}>
            {result.bridgeText}
          </p>

          <div style={{ background: 'white', border: '0.5px solid #e7e5e4', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', color: '#a8a29e', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              from the tradition
            </p>
            <p style={{ fontSize: '13px', color: '#78716c', lineHeight: 1.7, margin: 0 }}>
              {result.concept.encounter}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saved}
            style={{ width: '100%', background: 'white', border: '0.5px solid #d6d3d1', borderRadius: '16px', padding: '16px', fontSize: '12px', letterSpacing: '0.15em', color: saved ? '#a8a29e' : '#78716c', cursor: saved ? 'default' : 'pointer', marginBottom: '12px', transition: 'color 0.2s' }}
          >
            {saved ? 'moment saved' : 'save this moment'}
          </button>

          <p
            onClick={handleReset}
            style={{ fontSize: '12px', color: '#a8a29e', letterSpacing: '0.1em', textAlign: 'center', cursor: 'pointer', margin: 0 }}
          >
            explore another moment →
          </p>
        </div>
      )}

    </main>
  )
}
