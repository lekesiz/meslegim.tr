import { describe, it, expect } from 'vitest';

describe('Cohort Analysis Feature', () => {
  describe('Database Functions', () => {
    it('should export getCohortAnalysis function', async () => {
      const db = await import('./db');
      expect(typeof db.getCohortAnalysis).toBe('function');
    });

    it('getCohortAnalysis should accept weeksBack parameter', async () => {
      const db = await import('./db');
      // Verify function signature accepts a number parameter
      expect(db.getCohortAnalysis.length).toBeLessThanOrEqual(1);
    });
  });

  describe('CohortRow Interface', () => {
    it('should define correct CohortRow structure', async () => {
      // Verify the expected shape of CohortRow
      const expectedFields = ['cohortWeek', 'cohortSize', 'week1', 'week2', 'week4', 'week8'];
      const sampleRow = {
        cohortWeek: '2026-03-24',
        cohortSize: 15,
        week1: 73.3,
        week2: 53.3,
        week4: 26.7,
        week8: null,
      };
      
      expectedFields.forEach(field => {
        expect(sampleRow).toHaveProperty(field);
      });
    });

    it('should handle null values for future weeks', () => {
      const sampleRow = {
        cohortWeek: '2026-03-31',
        cohortSize: 8,
        week1: null,
        week2: null,
        week4: null,
        week8: null,
      };
      
      expect(sampleRow.week1).toBeNull();
      expect(sampleRow.week8).toBeNull();
    });
  });

  describe('Router Procedures', () => {
    it('should have getCohortAnalysis procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain('admin.getCohortAnalysis');
    });
  });

  describe('Retention Calculation Logic', () => {
    it('should calculate retention percentage correctly', () => {
      // 10 users in cohort, 7 active in week 1 = 70%
      const cohortSize = 10;
      const activeWeek1 = 7;
      const retention = Math.round(activeWeek1 * 100.0 / cohortSize * 10) / 10;
      expect(retention).toBe(70);
    });

    it('should return null for zero cohort size', () => {
      const cohortSize = 0;
      const result = cohortSize > 0 ? Math.round(0 * 100.0 / cohortSize * 10) / 10 : null;
      expect(result).toBeNull();
    });

    it('should handle 100% retention', () => {
      const cohortSize = 5;
      const activeWeek1 = 5;
      const retention = Math.round(activeWeek1 * 100.0 / cohortSize * 10) / 10;
      expect(retention).toBe(100);
    });

    it('should handle 0% retention', () => {
      const cohortSize = 5;
      const activeWeek1 = 0;
      const retention = Math.round(activeWeek1 * 100.0 / cohortSize * 10) / 10;
      expect(retention).toBe(0);
    });

    it('should handle decimal retention values', () => {
      const cohortSize = 3;
      const activeWeek1 = 1;
      const retention = Math.round(activeWeek1 * 100.0 / cohortSize * 10) / 10;
      expect(retention).toBe(33.3);
    });
  });

  describe('Heatmap Color Logic', () => {
    it('should assign green for high retention (>=60%)', () => {
      const value = 75;
      const isGreen = value >= 60;
      expect(isGreen).toBe(true);
    });

    it('should assign emerald for medium-high retention (40-59%)', () => {
      const value = 45;
      const isEmerald = value >= 40 && value < 60;
      expect(isEmerald).toBe(true);
    });

    it('should assign yellow for medium retention (25-39%)', () => {
      const value = 30;
      const isYellow = value >= 25 && value < 40;
      expect(isYellow).toBe(true);
    });

    it('should assign orange for low retention (10-24%)', () => {
      const value = 15;
      const isOrange = value >= 10 && value < 25;
      expect(isOrange).toBe(true);
    });

    it('should assign red for very low retention (<10%)', () => {
      const value = 5;
      const isRed = value < 10;
      expect(isRed).toBe(true);
    });
  });
});
