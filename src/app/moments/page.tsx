'use client'

// this page fetches all explorations the user has saved
// it uses the same sessionId from localStorage to identify them

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SavedMoment {
  id: string
  user_input: string
  ai_bridge_text: string
  created_at: string
  concepts: {
    word: string
    script: string
    meaning: string
  }
}

export default function Moments() {
  const [moments, setMoments] = useState<SavedMoment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // get the sessionId we stored in localStorage when the user first visited
    const sessionId = localStorage.getItem('samskritam_session')
    if (!sessionId) {
      setLoading(false)
      return
    }

    fetch(`/api/moments?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setMoments(data.moments || [])
        setLoading(false)
      })
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>

      {/* header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', width: '100%', maxWidth: '520px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', color: '#44403c', margin: '0 0 6px' }}>
          samskritam
        </h1>
        <p style={{ fontSize: '12px', color: '#a8a29e', letterSpacing: '0.12em', margin: '0 0 24px' }}>
          ancient words for modern moments
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <span
            onClick={() => router.push('/')}
            style={{ fontSize: '12px', color: '#a8a29e', letterSpacing: '0.1em', cursor: 'pointer' }}
          >
            explore
          </span>
          <span style={{ fontSize: '12px', color: '#44403c', letterSpacing: '0.1em', borderBottom: '0.5px solid #44403c', paddingBottom: '2px' }}>
            my moments
          </span>
        </div>
      </div>

      {/* content */}
      {loading && (
        <p style={{ fontSize: '13px', color: '#a8a29e', letterSpacing: '0.1em' }}>
          gathering your moments...
        </p>
      )}

      {!loading && moments.length === 0 && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#a8a29e', marginBottom: '16px' }}>
            you haven't saved any moments yet
          </p>
          <span
            onClick={() => router.push('/')}
            style={{ fontSize: '12px', color: '#78716c', letterSpacing: '0.1em', cursor: 'pointer' }}
          >
            begin exploring →
          </span>
        </div>
      )}

      {!loading && moments.length > 0 && (
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {moments.map(moment => (
            <div
              key={moment.id}
              style={{ background: 'white', border: '0.5px solid #e7e5e4', borderRadius: '16px', padding: '24px' }}
            >
              {/* sanskrit word */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: 300, color: '#44403c', lineHeight: 1 }}>
                  {moment.concepts?.script}
                </span>
                <span style={{ fontSize: '14px', letterSpacing: '0.15em', color: '#78716c' }}>
                  {moment.concepts?.word}
                </span>
              </div>

              {/* meaning */}
              <p style={{ fontSize: '12px', color: '#a8a29e', fontStyle: 'italic', margin: '0 0 12px' }}>
                {moment.concepts?.meaning}
              </p>

              {/* divider */}
              <div style={{ width: '24px', height: '0.5px', background: '#e7e5e4', margin: '0 0 12px' }} />

              {/* what the user shared */}
              <p style={{ fontSize: '12px', color: '#a8a29e', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                you shared
              </p>
              <p style={{ fontSize: '13px', color: '#78716c', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.6 }}>
                "{moment.user_input}"
              </p>

              {/* bridge text */}
              <p style={{ fontSize: '13px', color: '#57534e', lineHeight: 1.7, margin: 0 }}>
                {moment.ai_bridge_text}
              </p>

              {/* date */}
              <p style={{ fontSize: '11px', color: '#d6d3d1', margin: '12px 0 0', textAlign: 'right' }}>
                {new Date(moment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

    </main>
  )
}