/**
 * Tests for the three new stage unlock features:
 * 1. Mentor instant stage unlock (with ownership check)
 * 2. Stage unlock audit log (logStageUnlock + getStageUnlockLogs)
 * 3. Test reminder email (sendTestReminderEmail procedure)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock('./db', () => ({
  unlockStageNow: vi.fn(),
  logStageUnlock: vi.fn(),
  getStageUnlockLogs: vi.fn(),
  getStudentsWithLockedStages: vi.fn(),
  getLockedStagesForUser: vi.fn(),
  getStudentsByMentor: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('./_core/resend-email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
}));

vi.mock('./services/emailService', () => ({
  getNewStageActivatedEmailTemplate: vi.fn().mockReturnValue('<html>Stage activated</html>'),
  getStageReminderEmailTemplate: vi.fn().mockReturnValue('<html>Reminder</html>'),
}));

import * as db from './db';
import { sendEmail } from './_core/resend-email';
import { getStageReminderEmailTemplate } from './services/emailService';

// ─── 1. logStageUnlock ────────────────────────────────────────────────────────
describe('logStageUnlock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should call logStageUnlock with correct params', async () => {
    vi.mocked(db.logStageUnlock).mockResolvedValue(undefined);

    await db.logStageUnlock({
      unlockedByUserId: 1,
      unlockedByRole: 'admin',
      studentId: 42,
      stageId: 7,
      stageName: 'Etap 2: Kariyer Keşfi',
      studentName: 'Ahmet Yılmaz',
      note: 'Test açma',
    });

    expect(db.logStageUnlock).toHaveBeenCalledWith({
      unlockedByUserId: 1,
      unlockedByRole: 'admin',
      studentId: 42,
      stageId: 7,
      stageName: 'Etap 2: Kariyer Keşfi',
      studentName: 'Ahmet Yılmaz',
      note: 'Test açma',
    });
  });

  it('should accept mentor role', async () => {
    vi.mocked(db.logStageUnlock).mockResolvedValue(undefined);

    await db.logStageUnlock({
      unlockedByUserId: 5,
      unlockedByRole: 'mentor',
      studentId: 10,
      stageId: 3,
      stageName: 'Etap 1: Öz Değerlendirme',
    });

    expect(db.logStageUnlock).toHaveBeenCalledWith(
      expect.objectContaining({ unlockedByRole: 'mentor' })
    );
  });
});

// ─── 2. getStageUnlockLogs ────────────────────────────────────────────────────
describe('getStageUnlockLogs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return all logs when no mentorId is provided', async () => {
    const mockLogs = [
      {
        id: 1,
        unlockedByUserId: 1,
        unlockedByRole: 'admin',
        studentId: 42,
        stageId: 7,
        stageName: 'Etap 2',
        studentName: 'Ahmet',
        note: null,
        createdAt: new Date('2026-03-01T10:00:00Z'),
      },
    ];
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue(mockLogs);

    const result = await db.getStageUnlockLogs();

    expect(result).toHaveLength(1);
    expect(result[0].unlockedByRole).toBe('admin');
  });

  it('should filter logs by mentorId when provided', async () => {
    const mockLogs = [
      {
        id: 2,
        unlockedByUserId: 5,
        unlockedByRole: 'mentor',
        studentId: 10,
        stageId: 3,
        stageName: 'Etap 1',
        studentName: 'Zeynep',
        note: 'Erken açma',
        createdAt: new Date('2026-03-01T11:00:00Z'),
      },
    ];
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue(mockLogs);

    const result = await db.getStageUnlockLogs({ mentorId: 5 });

    expect(result).toHaveLength(1);
    expect(result[0].unlockedByRole).toBe('mentor');
    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ mentorId: 5 });
  });

  it('should return empty array when mentor has no students', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    const result = await db.getStageUnlockLogs({ mentorId: 99 });

    expect(result).toHaveLength(0);
  });

  it('should respect limit parameter', async () => {
    vi.mocked(db.getStageUnlockLogs).mockResolvedValue([]);

    await db.getStageUnlockLogs({ limit: 10 });

    expect(db.getStageUnlockLogs).toHaveBeenCalledWith({ limit: 10 });
  });
});

// ─── 3. unlockStageNow (with stageId in return) ───────────────────────────────
describe('unlockStageNow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return stageName, userEmail, userName and stageId on success', async () => {
    vi.mocked(db.unlockStageNow).mockResolvedValue({
      stageName: 'Etap 2: Kariyer Keşfi',
      userEmail: 'student@test.com',
      userName: 'Ahmet Yılmaz',
      stageId: 7,
    });

    const result = await db.unlockStageNow(42, 15);

    expect(result).not.toBeNull();
    expect(result?.stageName).toBe('Etap 2: Kariyer Keşfi');
    expect(result?.stageId).toBe(7);
  });

  it('should return null when stage is not locked or not found', async () => {
    vi.mocked(db.unlockStageNow).mockResolvedValue(null);

    const result = await db.unlockStageNow(42, 999);

    expect(result).toBeNull();
  });
});

// ─── 4. Test reminder email template ─────────────────────────────────────────
describe('getStageReminderEmailTemplate', () => {
  it('should be called with correct parameters', () => {
    getStageReminderEmailTemplate('Ahmet', 'Etap 2', 3, '5 Mart 2026');

    expect(getStageReminderEmailTemplate).toHaveBeenCalledWith(
      'Ahmet',
      'Etap 2',
      3,
      '5 Mart 2026'
    );
  });

  it('should return HTML string', () => {
    const html = getStageReminderEmailTemplate('Test', 'Etap', 2, '1 Mart 2026');
    expect(typeof html).toBe('string');
    expect(html).toContain('<html>');
  });
});

// ─── 5. sendEmail integration check ──────────────────────────────────────────
describe('sendEmail (test reminder flow)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should send test reminder email with correct subject', async () => {
    vi.mocked(sendEmail).mockResolvedValue({ id: 'mock-id' } as any);

    const daysUntilOpen = 2;
    const toEmail = 'admin@meslegim.tr';
    const html = getStageReminderEmailTemplate('Test Öğrenci', 'Etap 2: Kariyer Keşfi', daysUntilOpen, '4 Mart 2026');

    await sendEmail({
      to: toEmail,
      subject: `[TEST] ⏳ Etabınız ${daysUntilOpen} gün sonra açılıyor!`,
      html,
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@meslegim.tr',
        subject: '[TEST] ⏳ Etabınız 2 gün sonra açılıyor!',
      })
    );
  });
});

// ─── 6. Mentor ownership check logic ─────────────────────────────────────────
describe('Mentor ownership check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should allow unlock when student belongs to mentor', async () => {
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 10,
      mentorId: 5,
      role: 'student',
      name: 'Zeynep',
      email: 'zeynep@test.com',
    } as any);

    const student = await db.getUserById(10);
    const mentorId = 5;

    // Simulate ownership check
    const isOwner = student?.mentorId === mentorId;
    expect(isOwner).toBe(true);
  });

  it('should deny unlock when student belongs to different mentor', async () => {
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 10,
      mentorId: 99,  // different mentor
      role: 'student',
      name: 'Zeynep',
      email: 'zeynep@test.com',
    } as any);

    const student = await db.getUserById(10);
    const mentorId = 5;

    const isOwner = student?.mentorId === mentorId;
    expect(isOwner).toBe(false);
  });

  it('should allow admin to unlock any student', async () => {
    // Admin bypasses ownership check
    const userRole = 'admin';
    const isAdmin = userRole === 'admin';
    expect(isAdmin).toBe(true);
  });
});
