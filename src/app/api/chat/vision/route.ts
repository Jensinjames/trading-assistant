import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT_ID,
});

export async function POST(request: Request) {
  try {
    const { messages, image } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // If an image is provided, add it to the last user message
    if (image) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content = [
          { type: 'text', text: lastMessage.content },
          {
            type: 'image_url',
            image_url: {
              url: image,
              detail: 'high'
            }
          }
        ];
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      })),
      max_tokens: 500,
    });

    const reply = response.choices[0].message;

    return NextResponse.json({
      role: reply.role,
      content: reply.content,
    });
  } catch (error: any) {
    console.error('Error in chat vision API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 