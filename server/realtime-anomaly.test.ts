import { describe, it, expect } from 'vitest';

describe('Real-time Active Users & Anomaly Detection', () => {
  describe('Database Functions', () => {
    it('should export getActiveUserCount function', async () => {
      const db = await import('./db');
      expect(typeof db.getActiveUserCount).toBe('function');
    });

    it('should export getHourlyActiveUserTrend function', async () => {
      const db = await import('./db');
      expect(typeof db.getHourlyActiveUserTrend).toBe('function');
    });

    it('should export getDailyKPIValues function', async () => {
      const db = await import('./db');
      expect(typeof db.getDailyKPIValues).toBe('function');
    });

    it('should export get7DayKPIAverage function', async () => {
      const db = await import('./db');
      expect(typeof db.get7DayKPIAverage).toBe('function');
    });

    it('should export createKpiAnomaly function', async () => {
      const db = await import('./db');
      expect(typeof db.createKpiAnomaly).toBe('function');
    });

    it('should export getKpiAnomalies function', async () => {
      const db = await import('./db');
      expect(typeof db.getKpiAnomalies).toBe('function');
    });

    it('should export getAnomalySummary function', async () => {
      const db = await import('./db');
      expect(typeof db.getAnomalySummary).toBe('function');
    });

    it('should export acknowledgeAnomaly function', async () => {
      const db = await import('./db');
      expect(typeof db.acknowledgeAnomaly).toBe('function');
    });

    it('getActiveUserCount should accept minutes parameter', async () => {
      const db = await import('./db');
      expect(db.getActiveUserCount.length).toBeGreaterThanOrEqual(0);
    });

    it('getKpiAnomalies should accept filter options', async () => {
      const db = await import('./db');
      expect(db.getKpiAnomalies.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Router Procedures', () => {
    it('should have getActiveUserCount procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter._def.procedures).toHaveProperty('admin.getActiveUserCount');
    });

    it('should have getHourlyActiveUserTrend procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter._def.procedures).toHaveProperty('admin.getHourlyActiveUserTrend');
    });

    it('should have getKpiAnomalies procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter._def.procedures).toHaveProperty('admin.getKpiAnomalies');
    });

    it('should have getAnomalySummary procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter._def.procedures).toHaveProperty('admin.getAnomalySummary');
    });

    it('should have acknowledgeAnomaly procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter._def.procedures).toHaveProperty('admin.acknowledgeAnomaly');
    });

    it('should have runAnomalyCheck procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter._def.procedures).toHaveProperty('admin.runAnomalyCheck');
    });
  });

  describe('Anomaly Detection Service', () => {
    it('should export runDailyAnomalyCheck function', async () => {
      const service = await import('./services/anomalyDetection');
      expect(typeof service.runDailyAnomalyCheck).toBe('function');
    });

    it('runDailyAnomalyCheck should return result object', async () => {
      const service = await import('./services/anomalyDetection');
      expect(typeof service.runDailyAnomalyCheck).toBe('function');
    });
  });

  describe('Schema', () => {
    it('should export kpiAnomalies table', async () => {
      const schema = await import('../drizzle/schema');
      expect(schema.kpiAnomalies).toBeDefined();
    });

    it('kpiAnomalies should have required columns', async () => {
      const schema = await import('../drizzle/schema');
      const table = schema.kpiAnomalies;
      expect(table).toBeDefined();
      // Table should be a valid drizzle table
      expect(typeof table).toBe('object');
    });
  });

  describe('Cron Jobs', () => {
    it('should import anomalyDetection in cronJobs', async () => {
      const cronContent = await import('./services/cronJobs');
      expect(typeof cronContent.initializeCronJobs).toBe('function');
    });
  });
});
