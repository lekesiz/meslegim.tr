import { describe, it, expect, vi } from 'vitest';

describe('Push Notification Integration', () => {
  describe('Notification Service', () => {
    it('should export notify function', async () => {
      const mod = await import('./services/notificationService');
      expect(typeof mod.notify).toBe('function');
    });

    it('should export sendPushNotification function', async () => {
      const mod = await import('./services/notificationService');
      expect(typeof mod.sendPushNotification).toBe('function');
    });
  });

  describe('Reminder Service', () => {
    it('should export startReminderService function', async () => {
      const mod = await import('./services/reminderService');
      expect(typeof mod.startReminderService).toBe('function');
    });

    it('should export stopReminderService function', async () => {
      const mod = await import('./services/reminderService');
      expect(typeof mod.stopReminderService).toBe('function');
    });
  });

  describe('Cron Jobs', () => {
    it('should import reminderService in cronJobs', async () => {
      const cronSource = await import('fs').then(fs =>
        fs.readFileSync('./server/services/cronJobs.ts', 'utf-8')
      );
      expect(cronSource).toContain("import { startReminderService } from './reminderService'");
      expect(cronSource).toContain('startReminderService()');
    });
  });

  describe('Push Subscription Router', () => {
    it('should have push subscription procedures in appRouter', async () => {
      const { appRouter } = await import('./routers');
      const procedures = Object.keys(appRouter._def.procedures);
      expect(procedures).toContain('notifications.subscribePush');
      expect(procedures).toContain('notifications.unsubscribePush');
    });

    it('should have notification list procedure', async () => {
      const { appRouter } = await import('./routers');
      const procedures = Object.keys(appRouter._def.procedures);
      expect(procedures).toContain('notifications.list');
    });
  });

  describe('Service Worker', () => {
    it('should have service worker file in public directory', async () => {
      const fs = await import('fs');
      const swExists = fs.existsSync('./client/public/sw.js');
      expect(swExists).toBe(true);
    });

    it('should handle push events in service worker', async () => {
      const fs = await import('fs');
      const swContent = fs.readFileSync('./client/public/sw.js', 'utf-8');
      expect(swContent).toContain('push');
      expect(swContent).toContain('showNotification');
    });

    it('should handle notification click events in service worker', async () => {
      const fs = await import('fs');
      const swContent = fs.readFileSync('./client/public/sw.js', 'utf-8');
      expect(swContent).toContain('notificationclick');
    });
  });

  describe('Push Notification Hook', () => {
    it('should have usePushNotifications hook file', async () => {
      const fs = await import('fs');
      const hookExists = fs.existsSync('./client/src/hooks/usePushNotifications.ts');
      expect(hookExists).toBe(true);
    });

    it('should export usePushNotifications hook', async () => {
      const fs = await import('fs');
      const hookContent = fs.readFileSync('./client/src/hooks/usePushNotifications.ts', 'utf-8');
      expect(hookContent).toContain('export function usePushNotifications');
    });
  });

  describe('Notify calls include pushPayload', () => {
    it('should include pushPayload in router notify calls', async () => {
      const fs = await import('fs');
      const routerContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      // All notify() calls in routers.ts should include pushPayload
      const notifyCalls = routerContent.match(/await notify\(\{[\s\S]*?\}\);/g) || [];
      for (const call of notifyCalls) {
        expect(call).toContain('pushPayload');
      }
    });

    it('should include pushPayload in cronJobs notify calls', async () => {
      const fs = await import('fs');
      const cronContent = fs.readFileSync('./server/services/cronJobs.ts', 'utf-8');
      const notifyCalls = cronContent.match(/await notify\(\{[\s\S]*?\}\);/g) || [];
      for (const call of notifyCalls) {
        expect(call).toContain('pushPayload');
      }
    });

    it('should include pushPayload in reminderService notify calls', async () => {
      const fs = await import('fs');
      const reminderContent = fs.readFileSync('./server/services/reminderService.ts', 'utf-8');
      const notifyCalls = reminderContent.match(/await notify\(\{[\s\S]*?\}\);/g) || [];
      for (const call of notifyCalls) {
        expect(call).toContain('pushPayload');
      }
    });

    it('should include pushPayload in badgeEngine notify calls', async () => {
      const fs = await import('fs');
      const badgeContent = fs.readFileSync('./server/services/badgeEngine.ts', 'utf-8');
      const notifyCalls = badgeContent.match(/await notify\(\{[\s\S]*?\}\);/g) || [];
      for (const call of notifyCalls) {
        expect(call).toContain('pushPayload');
      }
    });
  });

  describe('No remaining createNotification calls in routers', () => {
    it('should not have direct createNotification calls in routers.ts', async () => {
      const fs = await import('fs');
      const routerContent = fs.readFileSync('./server/routers.ts', 'utf-8');
      // All notification creation should go through notify()
      const directCalls = (routerContent.match(/db\.createNotification\(/g) || []).length;
      expect(directCalls).toBe(0);
    });
  });
});
