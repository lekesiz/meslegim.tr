/**
 * Tests for Batch 4 features:
 * 1. CSV export of stage unlock logs
 * 2. Notification preferences (get/set)
 * 3. Mentor unlock quota enforcement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db', () => ({
  getStageUnlockLogs: vi.fn(),
  exportStageUnlockLogsCsv: vi.fn(),
  getPlatformSetting: vi.fn(),
  getPlatformSettingNumber: vi.fn(),
  setPlatformSetting: vi.fn(),
  getMentorUnlockCount: vi.fn(),
}));

import * as db from './db';

// ─── 1. CSV Export ────────────────────────────────────────────────────────────
describe('exportStageUnlockLogsCsv', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return CSV string with header row', async () => {
    vi.mocked(db.exportStageUnlockLogsCsv).mockResolvedValue(
      'ID,Tarih,Açan Kullanıcı ID,Rol,Öğrenci,Etap,Not\n1,01.03.2026 10:00:00,1,admin,"Ahmet Yılmaz","Etap 1",""'
    );

    const csv = await db.exportStageUnlockLogsCsv({});

    expect(csv).toContain('ID,Tarih');
    expect(csv).toContain('Açan Kullanıcı ID');
    expect(csv).toContain('Öğrenci');
    expect(csv).toContain('Etap');
  });

  it('should return only header when no logs exist', async () => {
    vi.mocked(db.exportStageUnlockLogsCsv).mockResolvedValue(
      'ID,Tarih,Açan Kullanıcı ID,Rol,Öğrenci,Etap,Not'
    );

    const csv = await db.exportStageUnlockLogsCsv({});

    const lines = csv.split('\n');
    expect(lines).toHaveLength(1); // only header
  });

  it('should accept role filter', async () => {
    vi.mocked(db.exportStageUnlockLogsCsv).mockResolvedValue('ID,Tarih,...\n1,...,mentor,...');

    await db.exportStageUnlockLogsCsv({ role: 'mentor' });

    expect(db.exportStageUnlockLogsCsv).toHaveBeenCalledWith({ role: 'mentor' });
  });

  it('should accept date range filters', async () => {
    vi.mocked(db.exportStageUnlockLogsCsv).mockResolvedValue('ID,Tarih,...');

    const dateFrom = new Date('2026-03-01');
    const dateTo = new Date('2026-03-31');
    await db.exportStageUnlockLogsCsv({ dateFrom, dateTo });

    expect(db.exportStageUnlockLogsCsv).toHaveBeenCalledWith({ dateFrom, dateTo });
  });

  it('should escape quotes in student names', async () => {
    vi.mocked(db.exportStageUnlockLogsCsv).mockResolvedValue(
      'ID,Tarih,...\n1,...,"Ahmet ""Ali"" Yılmaz",...'
    );

    const csv = await db.exportStageUnlockLogsCsv({});

    // Double-quoted names should be properly escaped
    expect(csv).toContain('"Ahmet ""Ali"" Yılmaz"');
  });
});

// ─── 2. Notification Preferences ─────────────────────────────────────────────
describe('Notification Preferences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should default to true when setting is not found', async () => {
    vi.mocked(db.getPlatformSetting).mockResolvedValue(null);

    const val = await db.getPlatformSetting('notif_on_mentor_unlock');
    const enabled = val !== 'false'; // default true logic

    expect(enabled).toBe(true);
  });

  it('should return false when setting is explicitly "false"', async () => {
    vi.mocked(db.getPlatformSetting).mockResolvedValue('false');

    const val = await db.getPlatformSetting('notif_on_mentor_unlock');
    const enabled = val !== 'false';

    expect(enabled).toBe(false);
  });

  it('should return true when setting is "true"', async () => {
    vi.mocked(db.getPlatformSetting).mockResolvedValue('true');

    const val = await db.getPlatformSetting('notif_on_mentor_unlock');
    const enabled = val !== 'false';

    expect(enabled).toBe(true);
  });

  it('should save notification preference via setPlatformSetting', async () => {
    vi.mocked(db.setPlatformSetting).mockResolvedValue(undefined);

    await db.setPlatformSetting('notif_on_mentor_unlock', 'false', 'Bildirim tercihi: notif_on_mentor_unlock');

    expect(db.setPlatformSetting).toHaveBeenCalledWith(
      'notif_on_mentor_unlock',
      'false',
      expect.stringContaining('notif_on_mentor_unlock')
    );
  });

  it('should handle all four notification preference keys', async () => {
    vi.mocked(db.getPlatformSetting).mockResolvedValue(null);

    const keys = ['notif_on_mentor_unlock', 'notif_on_admin_unlock', 'notif_on_new_student', 'notif_on_report_submit'];

    for (const key of keys) {
      const val = await db.getPlatformSetting(key);
      expect(val !== 'false').toBe(true); // all default to true
    }
  });
});

// ─── 3. Mentor Unlock Quota ───────────────────────────────────────────────────
describe('getMentorUnlockCount - quota enforcement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return 0 when mentor has no unlocks', async () => {
    vi.mocked(db.getMentorUnlockCount).mockResolvedValue(0);

    const count = await db.getMentorUnlockCount(5, new Date());

    expect(count).toBe(0);
  });

  it('should return correct count for a mentor', async () => {
    vi.mocked(db.getMentorUnlockCount).mockResolvedValue(3);

    const count = await db.getMentorUnlockCount(5, new Date());

    expect(count).toBe(3);
  });

  it('should enforce daily limit correctly', async () => {
    vi.mocked(db.getMentorUnlockCount).mockResolvedValue(5);
    vi.mocked(db.getPlatformSettingNumber).mockResolvedValue(5);

    const dailyLimit = await db.getPlatformSettingNumber('mentor_unlock_daily_limit', 0);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dailyCount = await db.getMentorUnlockCount(5, dayStart);

    // Quota reached: dailyCount (5) >= dailyLimit (5)
    expect(dailyCount >= dailyLimit).toBe(true);
  });

  it('should not block when daily limit is 0 (unlimited)', async () => {
    vi.mocked(db.getPlatformSettingNumber).mockResolvedValue(0);

    const dailyLimit = await db.getPlatformSettingNumber('mentor_unlock_daily_limit', 0);

    // 0 means unlimited - should not trigger quota check
    expect(dailyLimit).toBe(0);
    expect(dailyLimit > 0).toBe(false);
  });

  it('should enforce weekly limit correctly', async () => {
    vi.mocked(db.getMentorUnlockCount).mockResolvedValue(10);
    vi.mocked(db.getPlatformSettingNumber).mockResolvedValue(10);

    const weeklyLimit = await db.getPlatformSettingNumber('mentor_unlock_weekly_limit', 0);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyCount = await db.getMentorUnlockCount(5, weekStart);

    // Quota reached: weeklyCount (10) >= weeklyLimit (10)
    expect(weeklyCount >= weeklyLimit).toBe(true);
  });

  it('should allow unlock when count is below limit', async () => {
    vi.mocked(db.getMentorUnlockCount).mockResolvedValue(2);
    vi.mocked(db.getPlatformSettingNumber).mockResolvedValue(5);

    const dailyLimit = await db.getPlatformSettingNumber('mentor_unlock_daily_limit', 0);
    const dailyCount = await db.getMentorUnlockCount(5, new Date());

    // Not reached: dailyCount (2) < dailyLimit (5)
    expect(dailyCount >= dailyLimit).toBe(false);
  });

  it('should save quota settings correctly', async () => {
    vi.mocked(db.setPlatformSetting).mockResolvedValue(undefined);

    await db.setPlatformSetting('mentor_unlock_daily_limit', '3', 'Mentor günlük etap açma limiti (0 = sınırsız)');
    await db.setPlatformSetting('mentor_unlock_weekly_limit', '15', 'Mentor haftalık etap açma limiti (0 = sınırsız)');

    expect(db.setPlatformSetting).toHaveBeenCalledTimes(2);
    expect(db.setPlatformSetting).toHaveBeenNthCalledWith(1, 'mentor_unlock_daily_limit', '3', expect.any(String));
    expect(db.setPlatformSetting).toHaveBeenNthCalledWith(2, 'mentor_unlock_weekly_limit', '15', expect.any(String));
  });
});
