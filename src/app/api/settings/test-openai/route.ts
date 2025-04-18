import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { apiKey, organization, projectId } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const openai = new OpenAI({ 
      apiKey,
      organization: organization || process.env.OPENAI_ORGANIZATION,
      project: projectId || process.env.OPENAI_PROJECT_ID,
    });
    
    // Test the connection with a simple completion request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test connection" }],
      max_tokens: 5
    });

    // Store the test result in memory (will be cleared when server restarts)
    const testResult = {
      success: true,
      timestamp: Date.now(),
      response: response.choices[0].message.content
    };

    return NextResponse.json(testResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to test OpenAI connection' },
      { status: 500 }
    );
  }
} 