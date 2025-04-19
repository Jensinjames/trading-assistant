import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  type OpenAIModelInfo, 
  type OpenAIModelResponse,
  MODEL_CONSTRAINTS,
  getModelConstraints
} from '@/types/openai';
import { z } from 'zod';

// Input validation schema
const requestSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  organization: z.string().optional(),
  projectId: z.string().optional(),
});

// Helper function to get model display name
function getModelDisplayName(modelId: string): string {
  const displayNames: Record<string, string> = {
    'gpt-4-0125-preview': 'GPT-4 Turbo (Latest)',
    'gpt-4-1106-preview': 'GPT-4 Turbo (Previous)',
    'gpt-4-vision-preview': 'GPT-4 Vision',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo-0125': 'GPT-3.5 Turbo (Latest)',
    'gpt-3.5-turbo-1106': 'GPT-3.5 Turbo (Previous)',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo (Auto-updating)',
  };
  return displayNames[modelId] || modelId;
}

// Helper function to check if a model is a chat model
function isChatModel(modelId: string): boolean {
  return modelId.includes('gpt-3.5') || modelId.includes('gpt-4');
}

export async function POST(request: Request) {
  try {
    // Validate input
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    
    const openai = new OpenAI({ 
      apiKey: validatedData.apiKey,
      organization: validatedData.organization,
      project: validatedData.projectId,
    });
    
    // Test API key with a simple request
    try {
      await openai.models.retrieve('gpt-3.5-turbo');
    } catch (error: any) {
      if (error.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid API key or insufficient permissions'
        }, { status: 401 });
      }
      throw error;
    }
    
    // Fetch available models
    const modelsResponse = await openai.models.list();
    
    // Filter and sort chat models
    const chatModels = modelsResponse.data
      .filter(model => isChatModel(model.id))
      .map(model => {
        const constraints = getModelConstraints(model.id);
        const modelInfo: OpenAIModelInfo = {
          id: model.id,
          name: getModelDisplayName(model.id),
          created: model.created,
          owned_by: model.owned_by,
          isLatest: model.id.includes('0125'),
          isTurbo: model.id.includes('turbo'),
          isVision: model.id.includes('vision'),
          contextWindow: constraints.contextWindow,
          costPer1kTokens: constraints.costPer1kTokens,
          maxOutputTokens: constraints.maxOutputTokens
        };
        return modelInfo;
      })
      .sort((a, b) => {
        // Sort order: GPT-4 before GPT-3.5, latest versions first
        if (a.id.includes('gpt-4') && !b.id.includes('gpt-4')) return -1;
        if (!a.id.includes('gpt-4') && b.id.includes('gpt-4')) return 1;
        if (a.isLatest && !b.isLatest) return -1;
        if (!a.isLatest && b.isLatest) return 1;
        return 0;
      });

    // Validate that we found some models
    if (chatModels.length === 0) {
      return NextResponse.json({ 
        error: 'No compatible chat models found for your account'
      }, { status: 404 });
    }

    const result: OpenAIModelResponse = {
      models: chatModels,
      defaultModel: 'gpt-3.5-turbo-0125'
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching OpenAI models:', error);
    
    // Handle specific error cases
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request parameters',
        details: error.errors 
      }, { status: 400 });
    }

    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.'
      }, { status: 429 });
    }

    if (error.status === 500) {
      return NextResponse.json({ 
        error: 'OpenAI service error. Please try again later.'
      }, { status: 502 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch OpenAI models' },
      { status: 500 }
    );
  }
} 