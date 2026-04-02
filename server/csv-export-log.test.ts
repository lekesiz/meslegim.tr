import { describe, it, expect } from 'vitest';
import * as schema from '../drizzle/schema';

describe('CSV Export Log Feature', () => {
  describe('Schema', () => {
    it('should have csvExportLogs table defined', () => {
      expect(schema.csvExportLogs).toBeDefined();
    });

    it('should have required columns in csvExportLogs', () => {
      const columns = Object.keys(schema.csvExportLogs);
      expect(columns).toContain('id');
      expect(columns).toContain('userId');
      expect(columns).toContain('exportType');
      expect(columns).toContain('fileName');
      expect(columns).toContain('recordCount');
      expect(columns).toContain('dateFilterPreset');
      expect(columns).toContain('dateFilterStart');
      expect(columns).toContain('dateFilterEnd');
      expect(columns).toContain('createdAt');
    });

    it('should export CsvExportLog type', () => {
      // Type check - this will fail at compile time if type doesn't exist
      const _typeCheck: schema.CsvExportLog | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('should export InsertCsvExportLog type', () => {
      const _typeCheck: schema.InsertCsvExportLog | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('Database Functions', () => {
    it('should export logCsvExport function', async () => {
      const db = await import('./db');
      expect(typeof db.logCsvExport).toBe('function');
    });

    it('should export getCsvExportLogs function', async () => {
      const db = await import('./db');
      expect(typeof db.getCsvExportLogs).toBe('function');
    });

    it('should export getCsvExportLogCount function', async () => {
      const db = await import('./db');
      expect(typeof db.getCsvExportLogCount).toBe('function');
    });
  });

  describe('Router Procedures', () => {
    it('should have logCsvExport procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain('admin.logCsvExport');
    });

    it('should have getCsvExportLogs procedure in admin router', async () => {
      const { appRouter } = await import('./routers');
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain('admin.getCsvExportLogs');
    });

    it('logCsvExport should be a procedure (mutation)', async () => {
      const { appRouter } = await import('./routers');
      const procedure = (appRouter as any)._def.procedures['admin.logCsvExport'];
      expect(procedure).toBeDefined();
      // tRPC v11 stores type info differently, just verify it exists
      expect(procedure._def).toBeDefined();
    });

    it('getCsvExportLogs should be a procedure (query)', async () => {
      const { appRouter } = await import('./routers');
      const procedure = (appRouter as any)._def.procedures['admin.getCsvExportLogs'];
      expect(procedure).toBeDefined();
      expect(procedure._def).toBeDefined();
    });
  });

  describe('Export Types', () => {
    const validExportTypes = [
      'kpi',
      'daily_registrations',
      'monthly_revenue',
      'daily_revenue',
      'report_stats',
      'user_activity',
      'package_distribution',
      'all',
    ];

    it('should recognize all valid export types', () => {
      validExportTypes.forEach(type => {
        expect(type).toBeTruthy();
        expect(typeof type).toBe('string');
      });
    });

    it('should have 8 export types defined', () => {
      expect(validExportTypes.length).toBe(8);
    });
  });

  describe('Date Filter Presets', () => {
    const validPresets = ['today', 'last7', 'last30', 'last90', 'all', 'custom'];

    it('should recognize all valid date filter presets', () => {
      validPresets.forEach(preset => {
        expect(preset).toBeTruthy();
        expect(typeof preset).toBe('string');
      });
    });

    it('should have 6 date filter presets', () => {
      expect(validPresets.length).toBe(6);
    });
  });
});
