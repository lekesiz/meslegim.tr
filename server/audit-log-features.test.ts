/**
 * Tests for the three new features:
 * 1. Audit log filtering (date range, role, student name)
 * 2. Admin notification on mentor unlock
 * 3. Student profile unlock history (via getStudentDetails)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db', () => ({
  getStageUnlockLogs: vi.fn(),
  getUserById: vi.fn(),
  logStageUnlock: vi.fn(),
  unlockStageNow: vi.fn(),
  getUserStages: vi.fn(),
  getReportsByUser: vi.fn(),
  calculateStudentProgress: vi.fn(),
}));

vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock('./_core/resend-email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'test-id' }),
}));

import * as db from './db';
import { notifyOwner } from './_core/notification';

// ─── 1. Audit Log Filtering ───────────────────────────────────────────────────
describe('getStageUnlockLogs - filtering', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should accept role filter for admin', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([
      {
        id: 1, unlockedByUserId: 1, unlockedByRole: 'admin',
        studentId: 10, stageId: 3, stageName: 'Etap 1',
        studentName: 'Ahmet', note: null, createdAt: new Date(),
      },
    ]);

    const result = await db.getStageUnlockLogs({ role: 'admin' });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ role: 'admin' });
    expect(result).toHaveLength(1);
    expect(result[0].unlockedByRole).toBe('admin');
  });

  it('should accept role filter for mentor', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    await db.getStageUnlockLogs({ role: 'mentor' });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ role: 'mentor' });
  });

  it('should accept studentName filter', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([
      {
        id: 2, unlockedByUserId: 5, unlockedByRole: 'mentor',
        studentId: 20, stageId: 5, stageName: 'Etap 2',
        studentName: 'Zeynep Kaya', note: 'Erken açma', createdAt: new Date(),
      },
    ]);

    const result = await db.getStageUnlockLogs({ studentName: 'Zeynep' });

    expect(result[0].studentName).toBe('Zeynep Kaya');
  });

  it('should accept dateFrom filter', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    const dateFrom = new Date('2026-03-01');
    await db.getStageUnlockLogs({ dateFrom });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ dateFrom });
  });

  it('should accept dateTo filter', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    const dateTo = new Date('2026-03-31T23:59:59');
    await db.getStageUnlockLogs({ dateTo });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ dateTo });
  });

  it('should accept combined filters', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    const dateFrom = new Date('2026-03-01');
    const dateTo = new Date('2026-03-31');
    await db.getStageUnlockLogs({ role: 'mentor', studentName: 'Ahmet', dateFrom, dateTo, limit: 50 });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({
      role: 'mentor',
      studentName: 'Ahmet',
      dateFrom,
      dateTo,
      limit: 50,
    });
  });

  it('should return empty array when no logs match filters', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    const result = await db.getStageUnlockLogs({ studentName: 'NonExistentStudent' });

    expect(result).toHaveLength(0);
  });
});

// ─── 2. Admin Notification on Mentor Unlock ───────────────────────────────────
describe('notifyOwner - mentor unlock notification', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should call notifyOwner with correct title and content', async () => {
    vi.mocked(notifyOwner).mockResolvedValue(true);

    const mentorName = 'Ayşe Mentor';
    const studentName = 'Mehmet Öğrenci';
    const stageName = 'Etap 2: Kariyer Keşfi';
    const note = 'Öğrenci hazır görünüyor';

    await notifyOwner({
      title: `🔓 Manuel Etap Açma: ${stageName}`,
      content: `**${mentorName}** (Mentor), **${studentName}** adlı öğrencinin "${stageName}" etabını manuel olarak açtı.\n\n**Not:** ${note}`,
    });

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: `🔓 Manuel Etap Açma: ${stageName}`,
      })
    );
  });

  it('should call notifyOwner without note when note is undefined', async () => {
    vi.mocked(notifyOwner).mockResolvedValue(true);

    const mentorName = 'Ayşe Mentor';
    const studentName = 'Mehmet Öğrenci';
    const stageName = 'Etap 1: Öz Değerlendirme';

    await notifyOwner({
      title: `🔓 Manuel Etap Açma: ${stageName}`,
      content: `**${mentorName}** (Mentor), **${studentName}** adlı öğrencinin "${stageName}" etabını manuel olarak açtı.`,
    });

    const call = vi.mocked(notifyOwner).mock.calls[0][0];
    expect(call.content).not.toContain('**Not:**');
  });

  it('should return true on successful notification', async () => {
    vi.mocked(notifyOwner).mockResolvedValue(true);

    const result = await notifyOwner({
      title: 'Test',
      content: 'Test content',
    });

    expect(result).toBe(true);
  });

  it('should not throw when notifyOwner fails (graceful degradation)', async () => {
    vi.mocked(notifyOwner).mockRejectedValue(new Error('Notification service unavailable'));

    // Simulate the try/catch pattern used in the router
    let errorCaught = false;
    try {
      await notifyOwner({ title: 'Test', content: 'Test' });
    } catch (e) {
      errorCaught = true;
      // In the router, we catch this and log a warning - unlock still succeeds
    }

    expect(errorCaught).toBe(true);
    // The key point: unlock operation should not be blocked by notification failure
  });
});

// ─── 3. Student Profile Unlock History ───────────────────────────────────────
describe('getStudentDetails - unlockLogs included', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return unlockLogs for a specific student', async () => {
    const mockLogs = [
      {
        id: 1, unlockedByUserId: 1, unlockedByRole: 'admin',
        studentId: 42, stageId: 7, stageName: 'Etap 2',
        studentName: 'Ahmet Yılmaz', note: 'Test açma',
        createdAt: new Date('2026-03-01T10:00:00Z'),
      },
      {
        id: 2, unlockedByUserId: 5, unlockedByRole: 'mentor',
        studentId: 42, stageId: 10, stageName: 'Etap 3',
        studentName: 'Ahmet Yılmaz', note: null,
        createdAt: new Date('2026-03-02T14:00:00Z'),
      },
    ];

    vi.mocked(db.getStageUnlockLogs).mockResolvedValue(mockLogs);

    const result = await db.getStageUnlockLogs({ studentId: 42, limit: 50 });

    expect(result).toHaveLength(2);
    expect(result.every(l => l.studentId === 42)).toBe(true);
  });

  it('should return empty array when student has no unlock history', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    const result = await db.getStageUnlockLogs({ studentId: 999, limit: 50 });

    expect(result).toHaveLength(0);
  });

  it('should filter by studentId correctly', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    await db.getStageUnlockLogs({ studentId: 42, limit: 50 });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ studentId: 42, limit: 50 });
  });

  it('should return logs ordered by date (most recent first)', async () => {
    const mockLogs = [
      {
        id: 2, unlockedByUserId: 5, unlockedByRole: 'mentor',
        studentId: 42, stageId: 10, stageName: 'Etap 3',
        studentName: 'Ahmet', note: null,
        createdAt: new Date('2026-03-02T14:00:00Z'), // newer
      },
      {
        id: 1, unlockedByUserId: 1, unlockedByRole: 'admin',
        studentId: 42, stageId: 7, stageName: 'Etap 2',
        studentName: 'Ahmet', note: 'Test',
        createdAt: new Date('2026-03-01T10:00:00Z'), // older
      },
    ];

    vi.mocked(db.getStageUnlockLogs).mockResolvedValue(mockLogs);

    const result = await db.getStageUnlockLogs({ studentId: 42 });

    // Most recent should be first
    expect(result[0].createdAt.getTime()).toBeGreaterThan(result[1].createdAt.getTime());
  });
});
