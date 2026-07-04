import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  // get the sessionId from the query string e.g. /api/moments?sessionId=abc123
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ moments: [] })
  }

  // fetch all saved explorations for this session
  // join with concepts table to get the word, script, meaning
  const { data, error } = await supabase
    .from('explorations')
    .select(`
      id,
      user_input,
      ai_bridge_text,
      created_at,
      concepts (
        word,
        script,
        meaning
      )
    `)
    .eq('session_id', sessionId)  // only this user's explorations
    .eq('saved', true)             // only saved ones
    .order('created_at', { ascending: false })  // newest first

  if (error) {
    console.error('moments error:', error)
    return NextResponse.json({ moments: [] })
  }

  return NextResponse.json({ moments: data })
}