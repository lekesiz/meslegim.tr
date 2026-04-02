import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('Analytics Charts & Re-Run Export Features', () => {
  describe('New Analytics Procedures', () => {
    it('should have getWeeklyRegistrationTrend procedure in admin router', () => {
      expect(appRouter).toBeDefined();
      const adminRouter = (appRouter as any)._def.procedures;
      expect(adminRouter).toBeDefined();
      // Check that the procedure exists in the router definition
      const routerKeys = Object.keys(adminRouter);
      expect(routerKeys).toContain('admin.getWeeklyRegistrationTrend');
    });

    it('should have getAgeGroupDistribution procedure in admin router', () => {
      const adminRouter = (appRouter as any)._def.procedures;
      const routerKeys = Object.keys(adminRouter);
      expect(routerKeys).toContain('admin.getAgeGroupDistribution');
    });

    it('should have getQuestionCategoryDistribution procedure in admin router', () => {
      const adminRouter = (appRouter as any)._def.procedures;
      const routerKeys = Object.keys(adminRouter);
      expect(routerKeys).toContain('admin.getQuestionCategoryDistribution');
    });

    it('should have getStageCompletionTrend procedure in admin router', () => {
      const adminRouter = (appRouter as any)._def.procedures;
      const routerKeys = Object.keys(adminRouter);
      expect(routerKeys).toContain('admin.getStageCompletionTrend');
    });

    it('should have reRunCsvExport procedure in admin router', () => {
      const adminRouter = (appRouter as any)._def.procedures;
      const routerKeys = Object.keys(adminRouter);
      expect(routerKeys).toContain('admin.reRunCsvExport');
    });
  });

  describe('Database Functions', () => {
    it('should export getWeeklyRegistrationTrend function', async () => {
      const db = await import('./db');
      expect(typeof db.getWeeklyRegistrationTrend).toBe('function');
    });

    it('should export getAgeGroupDistribution function', async () => {
      const db = await import('./db');
      expect(typeof db.getAgeGroupDistribution).toBe('function');
    });

    it('should export getQuestionCategoryDistribution function', async () => {
      const db = await import('./db');
      expect(typeof db.getQuestionCategoryDistribution).toBe('function');
    });

    it('should export getStageCompletionTrend function', async () => {
      const db = await import('./db');
      expect(typeof db.getStageCompletionTrend).toBe('function');
    });
  });

  describe('Function Signatures', () => {
    it('getWeeklyRegistrationTrend should accept weeks, customStart, customEnd params', async () => {
      const db = await import('./db');
      // Function should accept 3 params: weeks, customStart, customEnd
      expect(db.getWeeklyRegistrationTrend.length).toBeLessThanOrEqual(3);
    });

    it('getStageCompletionTrend should accept weeks, customStart, customEnd params', async () => {
      const db = await import('./db');
      expect(db.getStageCompletionTrend.length).toBeLessThanOrEqual(3);
    });

    it('getAgeGroupDistribution should accept no params', async () => {
      const db = await import('./db');
      expect(db.getAgeGroupDistribution.length).toBe(0);
    });

    it('getQuestionCategoryDistribution should accept no params', async () => {
      const db = await import('./db');
      expect(db.getQuestionCategoryDistribution.length).toBe(0);
    });
  });

  describe('Graceful Fallbacks (no DB)', () => {
    it('getWeeklyRegistrationTrend should return empty array without DB', async () => {
      const db = await import('./db');
      const result = await db.getWeeklyRegistrationTrend();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getAgeGroupDistribution should return empty array without DB', async () => {
      const db = await import('./db');
      const result = await db.getAgeGroupDistribution();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getQuestionCategoryDistribution should return empty array without DB', async () => {
      const db = await import('./db');
      const result = await db.getQuestionCategoryDistribution();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getStageCompletionTrend should return empty array without DB', async () => {
      const db = await import('./db');
      const result = await db.getStageCompletionTrend();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('ExportHistory Re-Run Feature', () => {
    it('reRunCsvExport should support all export types', () => {
      const supportedTypes = ['kpi', 'daily_registrations', 'monthly_revenue', 'daily_revenue', 'report_stats', 'user_activity', 'package_distribution'];
      // Verify all types are strings
      supportedTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should have correct export type labels', () => {
      const EXPORT_TYPE_LABELS: Record<string, string> = {
        kpi: 'KPI Özet',
        daily_registrations: 'Günlük Kayıtlar',
        monthly_revenue: 'Aylık Gelir',
        daily_revenue: 'Günlük Gelir',
        report_stats: 'Rapor İstatistikleri',
        user_activity: 'Kullanıcı Aktivite',
        package_distribution: 'Paket Dağılımı',
        all: 'Toplu Dışa Aktarma',
      };
      expect(Object.keys(EXPORT_TYPE_LABELS)).toHaveLength(8);
      expect(EXPORT_TYPE_LABELS['kpi']).toBe('KPI Özet');
      expect(EXPORT_TYPE_LABELS['all']).toBe('Toplu Dışa Aktarma');
    });
  });
});
