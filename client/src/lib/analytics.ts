/**
 * Analytics Event Tracking
 * Umami analytics ile özel olay izleme
 */

// Umami global type
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
  }
}

/**
 * Özel olay gönder
 */
export function trackEvent(eventName: string, data?: Record<string, string | number | boolean>) {
  try {
    if (window.umami) {
      window.umami.track(eventName, data);
    }
  } catch {
    // Analytics hatalarını sessizce yut
  }
}

// Önceden tanımlı olaylar
export const analytics = {
  // Kayıt ve giriş
  register: (ageGroup: string) => trackEvent('register', { age_group: ageGroup }),
  login: (role: string) => trackEvent('login', { role }),
  logout: () => trackEvent('logout'),

  // Etap işlemleri
  stageStart: (stageId: number, stageName: string) => trackEvent('stage_start', { stage_id: stageId, stage_name: stageName }),
  stageComplete: (stageId: number, stageName: string) => trackEvent('stage_complete', { stage_id: stageId, stage_name: stageName }),

  // Rapor işlemleri
  reportView: (reportId: number) => trackEvent('report_view', { report_id: reportId }),
  reportDownloadPDF: (reportId: number) => trackEvent('report_download_pdf', { report_id: reportId }),

  // Mentor işlemleri
  mentorApproveStudent: (studentId: number) => trackEvent('mentor_approve_student', { student_id: studentId }),
  mentorApproveReport: (reportId: number) => trackEvent('mentor_approve_report', { report_id: reportId }),
  mentorUnlockStage: (studentId: number) => trackEvent('mentor_unlock_stage', { student_id: studentId }),

  // Admin işlemleri
  adminBulkAction: (action: string, count: number) => trackEvent('admin_bulk_action', { action, count }),

  // Geri bildirim
  feedbackSubmit: (npsScore: number) => trackEvent('feedback_submit', { nps_score: npsScore }),

  // Sayfa görüntüleme (SPA için)
  pageView: (path: string) => trackEvent('page_view', { path }),

  // Profil
  profileUpdate: () => trackEvent('profile_update'),
  passwordChange: () => trackEvent('password_change'),
};
