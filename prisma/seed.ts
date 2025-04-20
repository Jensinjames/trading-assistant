import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default assistant
  const assistant = await prisma.assistant.upsert({
    where: { id: 'default-assistant' },
    update: {},
    create: {
      id: 'default-assistant',
      name: 'Trading Assistant',
      description: 'Your AI trading assistant',
      model: 'gpt-3.5-turbo',
      systemPrompt: 'You are a helpful trading assistant. You help users analyze markets, understand trading concepts, and make informed decisions. You do not provide specific financial advice or recommendations.',
    },
  });

  console.log('Seeded default assistant');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });