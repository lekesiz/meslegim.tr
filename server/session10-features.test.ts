import { describe, it, expect, vi } from 'vitest';
import { appRouter } from './routers';

describe('Session 10 Features', () => {
  // ─── Admin Activity Feed ─────────────────────────────────────────────────
  describe('Admin Activity Feed', () => {
    it('getAdminActivityFeed procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.getAdminActivityFeed');
    });

    it('markAdminNotificationRead procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.markAdminNotificationRead');
    });

    it('markAllAdminNotificationsRead procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.markAllAdminNotificationsRead');
    });

    it('getAdminUnreadCount procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.getAdminUnreadCount');
    });
  });

  // ─── Scheduled Reports ───────────────────────────────────────────────────
  describe('Scheduled Reports', () => {
    it('getScheduledReportSettings procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.getScheduledReportSettings');
    });

    it('setScheduledReportSetting procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.setScheduledReportSetting');
    });

    it('sendManualKPIReport procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.sendManualKPIReport');
    });
  });

  // ─── PDF Report Generation ───────────────────────────────────────────────
  describe('PDF Report Generation', () => {
    it('generateAnalyticsPdf procedure exists', () => {
      expect(appRouter._def.procedures).toHaveProperty('admin.generateAnalyticsPdf');
    });
  });

  // ─── Scheduled Reports Service ───────────────────────────────────────────
  describe('Scheduled Reports Service', () => {
    it('scheduledReports module exports expected functions', async () => {
      const mod = await import('./services/scheduledReports');
      expect(typeof mod.sendScheduledKPIReport).toBe('function');
      expect(typeof mod.sendManualKPIReport).toBe('function');
    });
  });

  // ─── Analytics PDF Generator Service ─────────────────────────────────────
  describe('Analytics PDF Generator Service', () => {
    it('analyticsPdfGenerator module exports generateAnalyticsPDF', async () => {
      const mod = await import('./services/analyticsPdfGenerator');
      expect(typeof mod.generateAnalyticsPDF).toBe('function');
    });
  });

  // ─── DB Functions ────────────────────────────────────────────────────────
  describe('DB Functions', () => {
    it('getAdminUserIds function exists', async () => {
      const db = await import('./db');
      expect(typeof db.getAdminUserIds).toBe('function');
    });

    it('notifyAdmins function exists', async () => {
      const db = await import('./db');
      expect(typeof db.notifyAdmins).toBe('function');
    });

    it('getAdminActivityFeed function exists', async () => {
      const db = await import('./db');
      expect(typeof db.getAdminActivityFeed).toBe('function');
    });

    it('getAdminEmails function exists', async () => {
      const db = await import('./db');
      expect(typeof db.getAdminEmails).toBe('function');
    });
  });

  // ─── Stripe Webhook Notification Integration ─────────────────────────────
  describe('Stripe Webhook Notification', () => {
    it('stripeWebhook imports notifyAdmins', async () => {
      const webhookSource = await import('fs').then(fs => 
        fs.readFileSync('./server/stripeWebhook.ts', 'utf-8')
      );
      expect(webhookSource).toContain('notifyAdmins');
      expect(webhookSource).toContain('Yeni Satın Alma');
    });
  });

  // ─── Registration Notification ───────────────────────────────────────────
  describe('Registration Notification', () => {
    it('register procedure includes admin notification', async () => {
      const routerSource = await import('fs').then(fs => 
        fs.readFileSync('./server/routers.ts', 'utf-8')
      );
      expect(routerSource).toContain('Yeni Öğrenci Kaydı');
      expect(routerSource).toContain('notifyAdmins');
    });
  });

  // ─── Report Submission Notification ──────────────────────────────────────
  describe('Report Submission Notification', () => {
    it('submitStage procedure includes admin notification', async () => {
      const routerSource = await import('fs').then(fs => 
        fs.readFileSync('./server/routers.ts', 'utf-8')
      );
      expect(routerSource).toContain('Yeni Rapor Gönderimi');
    });
  });
});
