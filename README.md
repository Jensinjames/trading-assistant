# Trading Assistant

A powerful AI-powered trading assistant with real-time market data analysis, chat interface, and automated alerts.

## Features

- 💬 AI Chat Interface with GPT-4 integration
- 🎙️ Voice Input/Output support using Web Speech API
- 📊 Real-time market data from TradingView
- ⚡ Alert system for price and technical indicators
- 📱 Mobile-responsive design
- 🔐 Secure API key management
- 📈 Strategy management and backtesting
- 🤖 Automated trading signals
- 🌐 External data integration (Dexscreener, Birdeye, Twitter)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trading-assistant.git
cd trading-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string for session encryption
- `NEXTAUTH_URL` - Your app's URL (e.g. http://localhost:3000)

4. Initialize the database:
```bash
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trading_assistant"

# NextAuth
NEXTAUTH_SECRET="your-random-string"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# API Keys (stored per user in database)
# These are examples of what users will need to provide
OPENAI_API_KEY=""
TRADINGVIEW_API_KEY=""
TELEGRAM_BOT_TOKEN=""
```

## Architecture

- **Frontend**: Next.js 14 with App Router
- **API**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events for streaming
- **Background Jobs**: node-cron for scheduled tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Usage

1. Navigate to `http://localhost:3000/chat`
2. Start chatting with the assistant
3. Toggle voice input/output using the button in the top-right corner

## Voice Features

- Speech-to-text for hands-free input
- Text-to-speech for assistant responses
- Toggle voice features on/off at any time

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- Web Speech API
- Vercel AI SDK

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
