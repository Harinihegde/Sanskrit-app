import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export async function POST(req: NextRequest) {
  try {
    const { userInput, sessionId } = await req.json()

    if (!userInput) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 })
    }

    console.log('fetching concepts...')
    const { data: concepts, error } = await supabase
      .from('concepts')
      .select('*')

    if (error) {
      console.error('supabase error:', error)
      return NextResponse.json({ error: 'Could not load concepts' }, { status: 500 })
    }

    if (!concepts || concepts.length === 0) {
      console.error('no concepts found')
      return NextResponse.json({ error: 'No concepts found' }, { status: 500 })
    }

    console.log('concepts loaded:', concepts.length)

    const conceptList = concepts.map((c, i) =>
      `${i}. ${c.word} — ${c.meaning} (relates to: ${c.human_experience})`
    ).join('\n')

    const selectionResult = await model.generateContent(
      `A person said: "${userInput}"

Here are Sanskrit concepts numbered 0 to ${concepts.length - 1}:
${conceptList}

Reply with only the number of the single most relevant concept. Nothing else.`
    )

    const indexText = selectionResult.response.text().trim()
    console.log('gemini selected index:', indexText)
    const conceptIndex = Math.min(parseInt(indexText) || 0, concepts.length - 1)
    const chosen = concepts[conceptIndex]
    console.log('chosen concept:', chosen.word)

    const bridgeResult = await model.generateContent(
      `A person said: "${userInput}"

The Sanskrit concept is ${chosen.word} (${chosen.script}).
Its meaning: ${chosen.meaning}
How it relates to human experience: ${chosen.human_experience}

Write 2-3 sentences connecting this concept to what they shared.
Be warm and curious, not preachy or instructional.
Write as if you just remembered something that might be useful to them.
Do not explain Sanskrit. Do not teach. Just connect.`
    )

    const bridgeText = bridgeResult.response.text().trim()
    console.log('bridge text generated')

    

    // we also return the exploration id so the frontend can save it later
const { data: exploration } = await supabase
  .from('explorations')
  .insert({
    session_id: sessionId || 'anonymous',
    user_input: userInput,
    concept_id: chosen.id,
    ai_bridge_text: bridgeText
  })
  .select()
  .single()

return NextResponse.json({ 
  concept: chosen, 
  bridgeText,
  explorationId: exploration?.id  // the id of this exploration session
})

  } catch (e) {
    console.error('unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function PATCH(req: NextRequest) {
  const { explorationId } = await req.json()
  console.log('saving exploration id:', explorationId)

  const { error } = await supabase
    .from('explorations')
    .update({ saved: true })        // set saved = true
    .eq('id', explorationId)        // only for this specific row

  if (error) {
    console.error('save error:', error)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
