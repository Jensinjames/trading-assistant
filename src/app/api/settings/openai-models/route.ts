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
    
    // Fetch available models
    const response = await openai.models.list();
    
    // Filter for chat completion models
    const chatModels = response.data
      .filter(model => model.id.includes('gpt'))
      .map(model => ({
        id: model.id,
        name: model.id,
        created: model.created,
        owned_by: model.owned_by
      }));

    return NextResponse.json({ models: chatModels });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch OpenAI models' },
      { status: 500 }
    );
  }
} 