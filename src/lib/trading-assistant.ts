import { AssistantService } from '@/services/assistant';
import { prisma } from '@/server/db';

const TRADING_ASSISTANT_PROMPT = `You are an AI trading assistant, designed to help users with their cryptocurrency trading decisions and strategies. Your capabilities include:

1. Analyzing market trends and providing insights
2. Helping users develop and refine trading strategies
3. Explaining complex trading concepts in simple terms
4. Providing risk management advice
5. Monitoring market conditions and suggesting potential opportunities

Remember to:
- Always emphasize the importance of risk management
- Never provide direct financial advice or make specific trading recommendations
- Be clear about the speculative nature of cryptocurrency trading
- Encourage users to do their own research and make informed decisions
- Stay updated with market conditions and trends`;

export async function initializeTradingAssistant(openaiApiKey: string) {
  const assistantService = new AssistantService(prisma);
  
  // Check if the trading assistant already exists
  let assistant = await prisma.assistant.findFirst({
    where: { name: 'Trading Assistant' },
  });

  // If it doesn't exist, create it
  if (!assistant) {
    assistant = await prisma.assistant.create({
      data: {
        name: 'Trading Assistant',
        description: 'AI-powered trading companion',
        model: 'gpt-3.5-turbo',
        systemPrompt: TRADING_ASSISTANT_PROMPT
      }
    });
  }

  return assistant;
}

export async function createThread(data: { title: string; userId: string }) {
  // Get the trading assistant
  const assistant = await getTradingAssistant();
  if (!assistant) {
    throw new Error('Trading Assistant not found');
  }

  const thread = await prisma.chatThread.create({
    data: {
      userId: data.userId,
      assistantId: assistant.id,
      title: data.title,
    },
    include: {
      messages: true,
    },
  });

  return thread;
}

export async function getTradingAssistant() {
  return prisma.assistant.findFirst({
    where: { name: 'Trading Assistant' },
  });
}