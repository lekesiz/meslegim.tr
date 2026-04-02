import { describe, it, expect } from 'vitest';
import { getUserSegmentation } from './db';
import { generateAnalyticsPDF } from './services/analyticsPdfGenerator';

describe('User Segmentation & PDF Report Update', () => {
  describe('Database Functions', () => {
    it('should export getUserSegmentation function', () => {
      expect(typeof getUserSegmentation).toBe('function');
    });

    it('getUserSegmentation should accept segmentBy parameter', () => {
      expect(getUserSegmentation.length).toBeGreaterThanOrEqual(1);
    });

    it('getUserSegmentation should handle ageGroup segment type', async () => {
      const result = await getUserSegmentation('ageGroup');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getUserSegmentation should handle purchasedPackage segment type', async () => {
      const result = await getUserSegmentation('purchasedPackage');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getUserSegmentation should handle stageName segment type', async () => {
      const result = await getUserSegmentation('stageName');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getUserSegmentation should handle role segment type', async () => {
      const result = await getUserSegmentation('role');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getUserSegmentation should return correct structure', async () => {
      const result = await getUserSegmentation('ageGroup');
      if (result.length > 0) {
        const item = result[0];
        expect(item).toHaveProperty('segment');
        expect(item).toHaveProperty('userCount');
        expect(item).toHaveProperty('avgCompletionRate');
        expect(item).toHaveProperty('avgStagesCompleted');
        expect(item).toHaveProperty('premiumRate');
        expect(item).toHaveProperty('avgDaysOnPlatform');
      }
    });

    it('getUserSegmentation should accept date filters', async () => {
      const result = await getUserSegmentation('ageGroup', '2025-01-01', '2026-12-31');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('PDF Report Generator', () => {
    it('should export generateAnalyticsPDF function', () => {
      expect(typeof generateAnalyticsPDF).toBe('function');
    });

    it('generateAnalyticsPDF should accept options parameter', () => {
      expect(generateAnalyticsPDF.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Router Procedures', () => {
    it('should have getUserSegmentation procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      expect(appRouter).toBeDefined();
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain('admin.getUserSegmentation');
    });

    it('should have generateAnalyticsPdf procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain('admin.generateAnalyticsPdf');
    });
  });

  describe('Segmentation Data Validation', () => {
    it('should return numeric values for all metrics', async () => {
      const result = await getUserSegmentation('ageGroup');
      for (const item of result) {
        expect(typeof item.userCount).toBe('number');
        expect(typeof item.avgCompletionRate).toBe('number');
        expect(typeof item.avgStagesCompleted).toBe('number');
        expect(typeof item.premiumRate).toBe('number');
        expect(typeof item.avgDaysOnPlatform).toBe('number');
      }
    });

    it('should return non-negative values', async () => {
      const result = await getUserSegmentation('purchasedPackage');
      for (const item of result) {
        expect(item.userCount).toBeGreaterThanOrEqual(0);
        expect(item.avgCompletionRate).toBeGreaterThanOrEqual(0);
        expect(item.premiumRate).toBeGreaterThanOrEqual(0);
        expect(item.avgDaysOnPlatform).toBeGreaterThanOrEqual(0);
      }
    });

    it('completion rate should be between 0 and 100', async () => {
      const result = await getUserSegmentation('role');
      for (const item of result) {
        expect(item.avgCompletionRate).toBeGreaterThanOrEqual(0);
        expect(item.avgCompletionRate).toBeLessThanOrEqual(100);
      }
    });

    it('premium rate should be between 0 and 100', async () => {
      const result = await getUserSegmentation('ageGroup');
      for (const item of result) {
        expect(item.premiumRate).toBeGreaterThanOrEqual(0);
        expect(item.premiumRate).toBeLessThanOrEqual(100);
      }
    });
  });
});
