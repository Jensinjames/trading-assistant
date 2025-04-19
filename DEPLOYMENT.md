# Deployment Guide

## Prerequisites
- Fly.io account and CLI installed
- PostgreSQL database (provided by Fly.io or external)
- Redis instance (Upstash recommended for serverless)
- Node.js 18+ and npm/yarn

## Environment Variables
The following environment variables must be set in your deployment environment:

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trading_assistant"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-a-secure-secret"
NEXTAUTH_URL="https://your-domain.fly.dev"

# Redis Configuration (for rate limiting)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### Optional Default Settings
These settings can be configured per user in the application, but you can set defaults:
```bash
DEFAULT_OPENAI_API_KEY=""
DEFAULT_OPENAI_MODEL="gpt-3.5-turbo"
DEFAULT_OPENAI_ORGANIZATION=""
DEFAULT_OPENAI_PROJECT_ID=""
DEFAULT_TRADINGVIEW_API_KEY=""
DEFAULT_TELEGRAM_BOT_TOKEN=""
```

## Deployment Steps

1. **Database Setup**
   ```bash
   # Create PostgreSQL database on Fly.io
   fly postgres create
   
   # Attach database to your app
   fly postgres attach <database-name>
   ```

2. **Redis Setup**
   - Create a Redis instance on Upstash
   - Copy the REST URL and token to your environment variables

3. **Environment Setup**
   ```bash
   # Set required secrets
   fly secrets set DATABASE_URL="your-database-url"
   fly secrets set NEXTAUTH_SECRET="your-generated-secret"
   fly secrets set NEXTAUTH_URL="https://your-app-name.fly.dev"
   fly secrets set UPSTASH_REDIS_REST_URL="your-redis-url"
   fly secrets set UPSTASH_REDIS_REST_TOKEN="your-redis-token"
   ```

4. **Database Migration**
   ```bash
   # Run migrations before deploying
   npx prisma migrate deploy
   ```

5. **Deploy Application**
   ```bash
   fly deploy
   ```

## Post-Deployment

1. **Verify Application**
   - Check the application is running: `fly status`
   - View logs: `fly logs`
   - Access your application: `fly open`

2. **Setup Initial Admin User**
   - Register through the application
   - Set up your OpenAI API key in settings

## Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Store user-specific API keys in the database (encrypted)

2. **Rate Limiting**
   - Redis-based rate limiting is implemented
   - Configure limits in `src/app/api/chat/route.ts`

3. **Database Access**
   - Use strong passwords
   - Restrict database access to application IP
   - Regular backups (automated with Fly.io)

## Monitoring and Maintenance

1. **Logs**
   - Application logs: `fly logs`
   - Database logs: `fly postgres logs`

2. **Scaling**
   - Adjust resources in `fly.toml`
   - Monitor usage with `fly status`

3. **Updates**
   - Regular dependency updates
   - Database migrations
   - Security patches

## Troubleshooting

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check database status: `fly postgres status`
   - Ensure migrations are up to date

2. **Authentication Issues**
   - Verify NEXTAUTH_URL matches your domain
   - Check NEXTAUTH_SECRET is set
   - Review NextAuth logs

3. **Rate Limiting Issues**
   - Verify Redis connection
   - Check rate limit configuration
   - Monitor Redis usage

## Support and Resources
- Fly.io Documentation: https://fly.io/docs/
- NextAuth Documentation: https://next-auth.js.org/
- Prisma Documentation: https://www.prisma.io/docs/
- Upstash Documentation: https://docs.upstash.com/ 