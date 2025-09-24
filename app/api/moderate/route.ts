import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')
    
    const response = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: [
        {
          type: 'image_url',
          image_url: {
            url: image
          }
        }
      ]
    })

    const result = response.results[0]
    
    return NextResponse.json({
      flagged: result.flagged,
      categories: result.categories,
      category_scores: result.category_scores
    })
    
  } catch (error) {
    console.error('Moderation error:', error)
    return NextResponse.json(
      { error: 'Moderation failed' }, 
      { status: 500 }
    )
  }
}