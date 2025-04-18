import cron from 'node-cron';
import { AlertManager } from '@/lib/alerts/alertManager';
import { ExternalDataScraper } from '@/lib/scraper/externalData';

export class JobScheduler {
  private alertManager: AlertManager;
  private externalScraper: ExternalDataScraper;

  constructor() {
    this.alertManager = new AlertManager();
    this.externalScraper = new ExternalDataScraper();
  }

  startJobs(): void {
    // Check alerts every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.alertManager.checkAlerts();
      } catch (error) {
        console.error('Error checking alerts:', error);
      }
    });

    // Update external data hourly
    cron.schedule('0 * * * *', async () => {
      try {
        await this.externalScraper.updateAll();
      } catch (error) {
        console.error('Error updating external data:', error);
      }
    });
  }

  async manualRefresh(): Promise<void> {
    try {
      await Promise.all([
        this.alertManager.checkAlerts(),
        this.externalScraper.updateAll(),
      ]);
    } catch (error) {
      console.error('Error during manual refresh:', error);
      throw error;
    }
  }
} 