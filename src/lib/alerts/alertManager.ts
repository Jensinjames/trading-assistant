import { prisma } from '@/server/db';
import { TradingViewService } from '../market/tradingview';
import nodemailer from 'nodemailer';
import { Telegraf } from 'telegraf';

interface AlertNotification {
  userId: string;
  title: string;
  message: string;
  channels: string[];
}

export class AlertManager {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async checkAlerts(): Promise<void> {
    const activeAlerts = await prisma.alertRule.findMany({
      where: { isActive: true },
      include: { user: { include: { settings: true } } },
    });

    for (const alert of activeAlerts) {
      try {
        const tradingView = new TradingViewService(alert.userId);
        const { price, rsi, ema } = await tradingView.getIndicators(alert.coin);

        const shouldTrigger = this.evaluateCondition(
          alert.condition,
          { price, rsi, ema },
          alert.threshold
        );

        if (shouldTrigger) {
          await this.sendNotification({
            userId: alert.userId,
            title: `Alert Triggered: ${alert.coin}`,
            message: `${alert.coin} has met the condition: ${alert.condition} (threshold: ${alert.threshold})
Current values:
- Price: $${price.toFixed(2)}
- RSI: ${rsi.toFixed(2)}
- EMA: ${ema.toFixed(2)}`,
            channels: alert.channels,
          });

          // Optionally deactivate one-time alerts
          if (alert.condition.includes('once')) {
            await prisma.alertRule.update({
              where: { id: alert.id },
              data: { isActive: false },
            });
          }
        }
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }
  }

  private evaluateCondition(
    condition: string,
    values: { price: number; rsi: number; ema: number },
    threshold: number
  ): boolean {
    switch (condition) {
      case 'price_above':
        return values.price > threshold;
      case 'price_below':
        return values.price < threshold;
      case 'rsi_above':
        return values.rsi > threshold;
      case 'rsi_below':
        return values.rsi < threshold;
      case 'price_crosses_ema':
        return Math.abs(values.price - values.ema) < threshold;
      default:
        return false;
    }
  }

  private async sendNotification(notification: AlertNotification): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      include: { settings: true },
    });

    if (!user) return;

    for (const channel of notification.channels) {
      switch (channel) {
        case 'email':
          if (user.email) {
            await this.sendEmail(user.email, notification);
          }
          break;

        case 'telegram':
          if (user.settings?.telegramBotToken) {
            await this.sendTelegram(user.settings.telegramBotToken, notification);
          }
          break;

        case 'chat':
          await this.sendChatMessage(notification);
          break;
      }
    }
  }

  private async sendEmail(
    to: string,
    notification: AlertNotification
  ): Promise<void> {
    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: notification.title,
      text: notification.message,
    });
  }

  private async sendTelegram(
    botToken: string,
    notification: AlertNotification
  ): Promise<void> {
    const bot = new Telegraf(botToken);
    await bot.telegram.sendMessage(
      notification.userId,
      `${notification.title}\n\n${notification.message}`
    );
  }

  private async sendChatMessage(
    notification: AlertNotification
  ): Promise<void> {
    // Store the notification in the database to be picked up by the chat interface
    await prisma.message.create({
      data: {
        userId: notification.userId,
        role: 'assistant',
        content: `🚨 ${notification.title}\n\n${notification.message}`,
      },
    });
  }
} 