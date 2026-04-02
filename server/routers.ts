import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { generateStageReportAsync } from './reportHelper';
import { PRODUCTS, PACKAGE_ACCESS, type ProductId, formatPrice, getPackages } from './products';
import { checkAndAwardBadges, getUserBadgesWithStatus, getUserTotalXP, getLeaderboard, markBadgesNotified, getUnnotifiedBadges } from './services/badgeEngine';
import { generatePDF } from './services/pdfGenerator';
import { sendEmail, getRegistrationEmailTemplate, getApprovalEmailTemplate, getReportApprovedEmailTemplate, getReportRejectedEmailTemplate } from './_core/resend-email';
import { notifyOwner } from './_core/notification';
import bcrypt from 'bcryptjs';
import { sdk } from './_core/sdk';
import { hasRole, hasAnyRole, isSuperAdmin, isAdminLevel, isSchoolAdminLevel, hasRoleLevel, getHighestRole, addRole, removeRole } from './roleHelper';
import { sanitizeHtml, sanitizeEmail, sanitizeTcKimlik, sanitizePhone } from './utils/sanitization';

// Production'da gerçek domain'i kullan, development'ta localhost
function getBaseUrl(req?: { headers: { origin?: string; host?: string } }): string {
  // 1. Request origin varsa onu kullan
  if (req?.headers?.origin) return req.headers.origin;
  // 2. Host header'ından oluştur
  if (req?.headers?.host) {
    const protocol = req.headers.host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${req.headers.host}`;
  }
  // 3. Fallback: production'da meslegim.tr, development'ta localhost
  return process.env.NODE_ENV === 'production' ? 'https://meslegim.tr' : 'http://localhost:3000';
}

// Role-based procedures
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRole(ctx.user.role, 'student')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu işlem yalnızca öğrencilere özeldir' });
  }
  if (ctx.user.status !== 'active') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Hesabınızın bir mentor tarafından aktive edilmesi gerekiyor' });
  }
  return next({ ctx });
});

const mentorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ['mentor', 'admin', 'super_admin'])) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu işlem yalnızca mentorlara özeldir' });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdminLevel(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu işlem yalnızca yöneticilere özeldir' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user) return null;
      const { password: _, ...safeUser } = opts.ctx.user;
      return safeUser;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    verifyCertificate: publicProcedure
      .input(z.object({ certificateNumber: z.string() }))
      .query(async ({ input }) => {
        return await db.verifyCertificate(input.certificateNumber);
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Find user by email
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı' });
        }
        
        // Verify password
        const isValid = await bcrypt.compare(input.password, user.password);
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı' });
        }
        
        // Check if user is active (admin roles are auto-activated)
        if (user.status !== 'active') {
          const adminRoles = ['admin', 'super_admin', 'school_admin'];
          const isAdminRole = adminRoles.some(r => user.role.includes(r));
          if (isAdminRole) {
            // Auto-activate admin roles on first login
            await db.updateUser(user.id, { status: 'active' });
          } else {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Hesabınız henüz aktif değil. Yönetici onayından sonra e-posta ile bilgilendirileceksiniz.' });
          }
        }
        
        // If user has no openId (email/password registered users), assign one
        let effectiveOpenId = user.openId;
        if (!effectiveOpenId) {
          effectiveOpenId = `email:${user.email}`;
          // Persist the openId so future lookups work
          await db.updateUser(user.id, { openId: effectiveOpenId });
        }
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(effectiveOpenId, { name: user.name || user.email || 'User' });
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        // Never return password hash to client
        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser };
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          // Don't reveal if email exists or not (security best practice)
          return { success: true, message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi' };
        }
        
        // Generate reset token (valid for 1 hour)
        const resetToken = await sdk.createSessionToken(user.openId || '', { 
          name: user.name || '',
          expiresInMs: 3600000
        });
        
        // Send password reset email
        const resetUrl = `${getBaseUrl(ctx.req)}/reset-password/${resetToken}`;
        await sendEmail({
          to: user.email || '',
          subject: 'Meslegim.tr - Şifre Sıfırlama',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663028218705/jiPvNqaHRUg9H2uZgXUx3J/logo_3458a270.png" alt="Meslegim.tr Logo" style="height: 50px; margin-bottom: 20px;" />
                <h1 style="color: white; margin: 0;">Meslegim.tr</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Kariyer Değerlendirme Platformu</p>
              </div>
              <div style="padding: 40px 20px; background: white;">
                <h2 style="color: #333; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
                <p style="color: #666; line-height: 1.6;">Merhaba ${user.name},</p>
                <p style="color: #666; line-height: 1.6;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu link 1 saat geçerlidir.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Şifremi Sıfırla</a>
                </div>
                <p style="color: #999; font-size: 14px; line-height: 1.6;">Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
              </div>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
                <p style="margin: 0;">Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
                <p style="margin: 10px 0 0 0;">© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
              </div>
            </div>
          `,
        });
        
        return { success: true, message: 'Şifre sıfırlama linki e-posta adresinize gönderildi' };
      }),
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        // Validate password strength
        const pwd = input.newPassword;
        if (pwd.length < 8) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Şifre en az 8 karakter olmalıdır' });
        }
        if (!/[A-Z]/.test(pwd)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Şifre en az bir büyük harf içermelidir' });
        }
        if (!/[a-z]/.test(pwd)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Şifre en az bir küçük harf içermelidir' });
        }
        if (!/[0-9]/.test(pwd)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Şifre en az bir rakam içermelidir' });
        }
        
        // Verify token and get user
        let userOpenId: string;
        try {
          const session = await sdk.verifySession(input.token);
          if (!session || !session.openId) {
            throw new Error('Geçersiz oturum');
          }
          userOpenId = session.openId;
        } catch (error) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Geçersiz veya süresi dolmuş link' });
        }
        
        const user = await db.getUserByOpenId(userOpenId);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Kullanıcı bulunamadı' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);
        
        // Update password
        await db.updateUserPassword(user.id, hashedPassword);
        
        return { success: true, message: 'Şifreniz başarıyla güncellendi' };
      }),
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        phone: z.string().min(10).max(15),
        tcKimlik: z.string().length(11),
        ageGroup: z.enum(['14-17', '18-21', '22-24']),
        password: z.string()
          .min(8, 'Şifre en az 8 karakter olmalıdır')
          .max(128, 'Şifre en fazla 128 karakter olabilir')
          .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
          .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
          .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
      }))
      .mutation(async ({ input }) => {
        // Sanitize inputs
        const sanitizedEmail = sanitizeEmail(input.email);
        if (!sanitizedEmail) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Geçersiz e-posta adresi' });
        }
        const sanitizedPhone = sanitizePhone(input.phone);
        if (!sanitizedPhone) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Geçersiz telefon numarası' });
        }
        const sanitizedTcKimlik = sanitizeTcKimlik(input.tcKimlik);
        if (!sanitizedTcKimlik) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Geçersiz TC Kimlik numarası' });
        }
        const sanitizedName = sanitizeHtml(input.name.trim());
        
        // Check if user already exists
        const existingUser = await db.getUserByEmail(sanitizedEmail);
        if (existingUser) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Bu e-posta adresi zaten kayıtlı' });
        }
        
        // Check if TC Kimlik already exists
        const existingTcKimlik = await db.getUserByTcKimlik(sanitizedTcKimlik);
        if (existingTcKimlik) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Bu TC Kimlik numarası zaten kayıtlı' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        // Create new student with pending status
        const newUser = await db.createUser({
          name: sanitizedName,
          email: sanitizedEmail,
          password: hashedPassword,
          phone: sanitizedPhone,
          tcKimlik: sanitizedTcKimlik,
          ageGroup: input.ageGroup,
          role: 'student',
          status: 'pending',
        });
        
        // Send registration email
        try {
          await sendEmail({
            to: input.email,
            subject: 'Meslegim.tr - Başvurunuz Alındı',
            html: getRegistrationEmailTemplate(input.name, input.email),
          });
        } catch (error) {
          console.error('Failed to send registration email:', error);
          // Don't fail the registration if email fails
        }
        
        return { success: true, userId: newUser.id };
      }),
  }),

  // Profile management
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'Kullanıcı bulunamadı' });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profileImage: user.profileImage,
        ageGroup: user.ageGroup,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      };
    }),
    update: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        phone: z.string().min(10).optional(),
        bio: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updated = await db.updateUserProfile(ctx.user.id, input);
        if (updated) {
          const { password: _, ...safeUpdated } = updated;
          return { success: true, user: safeUpdated };
        }
        return { success: true, user: updated };
      }),
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !user.password) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Şifre değiştirme bu hesap için kullanılamaz' });
        }
        const valid = await bcrypt.compare(input.currentPassword, user.password);
        if (!valid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Mevcut şifreniz yanlış' });
        }
        const hashed = await bcrypt.hash(input.newPassword, 10);
        await db.changeUserPassword(ctx.user.id, hashed);
        return { success: true, message: 'Şifreniz başarıyla güncellendi' };
      }),
    sendVerificationEmail: protectedProcedure
      .mutation(async ({ ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !user.email) throw new TRPCError({ code: 'BAD_REQUEST', message: 'E-posta adresi bulunamadı' });
        if (user.emailVerified) throw new TRPCError({ code: 'BAD_REQUEST', message: 'E-posta zaten doğrulanmış' });
        
        const token = `ev_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
        await db.setEmailVerificationToken(ctx.user.id, token);
        
        const verifyUrl = `${getBaseUrl(ctx.req)}/verify-email/${token}`;
        await sendEmail({
          to: user.email,
          subject: 'Meslegim.tr - E-posta Doğrulama',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Meslegim.tr</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">E-posta Doğrulama</p>
              </div>
              <div style="padding: 40px 20px; background: white;">
                <p style="color: #666;">Merhaba ${user.name},</p>
                <p style="color: #666;">E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verifyUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">E-postamı Doğrula</a>
                </div>
              </div>
            </div>
          `,
        });
        return { success: true, message: 'Doğrulama e-postası gönderildi' };
      }),
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const verified = await db.verifyEmailByToken(input.token);
        if (!verified) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Geçersiz veya süresi dolmuş doğrulama linki' });
        return { success: true, message: 'E-posta adresiniz başarıyla doğrulandı' };
      }),
  }),

  // In-app notifications
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input?.limit || 50);
      }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),

    // Push subscription management
    subscribePush: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { savePushSubscription } = await import('./services/notificationService');
        await savePushSubscription(ctx.user.id, input);
        return { success: true };
      }),

    unsubscribePush: protectedProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { removePushSubscription } = await import('./services/notificationService');
        await removePushSubscription(ctx.user.id, input.endpoint);
        return { success: true };
      }),

    // Email preferences
    getEmailPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        const { getEmailPreferences } = await import('./services/notificationService');
        return await getEmailPreferences(ctx.user.id);
      }),

    updateEmailPreferences: protectedProcedure
      .input(z.object({
        stageActivation: z.boolean().optional(),
        reportReady: z.boolean().optional(),
        badgeEarned: z.boolean().optional(),
        certificateReady: z.boolean().optional(),
        stageReminder: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateEmailPreferences } = await import('./services/notificationService');
        return await updateEmailPreferences(ctx.user.id, input);
      }),

    // Get push subscription status
    getPushStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserPushSubscriptions } = await import('./services/notificationService');
        const subs = await getUserPushSubscriptions(ctx.user.id);
        return { subscribed: subs.length > 0, count: subs.length };
      }),
  }),

  // Admin procedures
  admin: router({
    getUsers: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    
    updateUser: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          role: z.enum(['student', 'mentor', 'admin']).optional(),
          status: z.enum(['pending', 'active', 'inactive']).optional(),
          ageGroup: z.enum(['14-17', '18-21', '22-24']).optional(),
          mentorId: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        // If status is being changed to active, initialize user stages if not already done
        if (input.data.status === 'active') {
          const student = await db.getUserById(input.id);
          if (student && student.ageGroup) {
            const existingStages = await db.getUserStages(student.id);
            if (existingStages.length === 0) {
              const ageGroupStages = await db.getStagesByAgeGroup(student.ageGroup);
              for (const stage of ageGroupStages) {
                const isFirstStage = stage.order === 1;
                await db.createUserStage({
                  userId: student.id,
                  stageId: stage.id,
                  status: isFirstStage ? 'active' : 'locked',
                });
              }
            }
          }
        }
        await db.updateUser(input.id, input.data);
        return { success: true };
      }),
    
    assignMentor: adminProcedure
      .input(z.object({
        studentId: z.number(),
        mentorId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateUser(input.studentId, { mentorId: input.mentorId });
        return { success: true };
      }),
    
    getAllReports: adminProcedure.query(async () => {
      return await db.getAllReports();
    }),
    
    getAllStages: adminProcedure.query(async () => {
      return await db.getAllStages();
    }),
    
    getAllQuestions: adminProcedure.query(async () => {
      return await db.getAllQuestions();
    }),
    
    getSystemStats: adminProcedure.query(async () => {
      const users = await db.getAllUsers();
      const reports = await db.getAllReports();
      const stages = await db.getAllStages();
      
      const students = users.filter(u => hasRole(u.role, 'student'));
      const activeStudents = students.filter(s => s.status === 'active');
      const pendingReports = reports.filter(r => r.status === 'pending');
      const approvedReports = reports.filter(r => r.status === 'approved');
      
      return {
        totalUsers: users.length,
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalMentors: users.filter(u => hasRole(u.role, 'mentor')).length,
        totalReports: reports.length,
        pendingReports: pendingReports.length,
        approvedReports: approvedReports.length,
        totalStages: stages.length,
      };
    }),
    
    getProgressStats: adminProcedure.query(async () => {
      const userStages = await db.getAllUserStages();
      const stages = await db.getAllStages();
      const users = await db.getAllUsers();
      const students = users.filter(u => hasRole(u.role, 'student'));
      
      // Stage completion stats
      const stageStats = stages.map(stage => {
        const stageUserStages = userStages.filter(us => us.stageId === stage.id);
        const completed = stageUserStages.filter(us => us.status === 'completed').length;
        const inProgress = stageUserStages.filter(us => us.status === 'active').length;
        const notStarted = students.length - stageUserStages.length;
        
        return {
          stageId: stage.id,
          stageName: stage.name,
          ageGroup: stage.ageGroup,
          completed,
          inProgress,
          notStarted,
          total: students.length,
        };
      });
      
      // Average completion time per stage
      const completionTimes = userStages
        .filter(us => us.status === 'completed' && us.completedAt && us.unlockedAt)
        .map(us => ({
          stageId: us.stageId,
          days: Math.max(0, Math.floor((new Date(us.completedAt!).getTime() - new Date(us.unlockedAt!).getTime()) / (1000 * 60 * 60 * 24))),
        }));
      
      const avgCompletionByStage = stages.map(stage => {
        const stageTimes = completionTimes.filter(ct => ct.stageId === stage.id);
        const avgDays = stageTimes.length > 0
          ? Math.round(stageTimes.reduce((sum, ct) => sum + ct.days, 0) / stageTimes.length)
          : 0;
        return {
          stageId: stage.id,
          stageName: stage.name,
          avgDays,
        };
      });
      
      // Dropout analysis - students who haven't completed any stage in 30+ days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeStudents = students.filter(s => s.status === 'active');
      const inactiveStudents = activeStudents.filter(student => {
        const studentStages = userStages.filter(us => us.userId === student.id);
        const lastActivity = studentStages
          .filter(us => us.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
        
        if (!lastActivity) return true; // Never completed any stage
        return new Date(lastActivity.completedAt!).getTime() < thirtyDaysAgo.getTime();
      });
      
      return {
        stageStats,
        avgCompletionByStage,
        dropoutRate: activeStudents.length > 0 ? Math.round((inactiveStudents.length / activeStudents.length) * 100) : 0,
        inactiveStudents: inactiveStudents.length,
      };
    }),
    
    sendBulkEmail: adminProcedure
      .input(z.object({
        subject: z.string().min(1),
        message: z.string().min(1),
        targetGroup: z.enum(['all', '14-17', '18-21', '22-24', 'pending', 'active']),
      }))
      .mutation(async ({ input }) => {
        const users = await db.getAllUsers();
        let targetUsers = users.filter(u => hasRole(u.role, 'student'));
        
        // Filter by target group
        if (input.targetGroup !== 'all') {
          if (['14-17', '18-21', '22-24'].includes(input.targetGroup)) {
            targetUsers = targetUsers.filter(u => u.ageGroup === input.targetGroup);
          } else if (input.targetGroup === 'pending' || input.targetGroup === 'active') {
            targetUsers = targetUsers.filter(u => u.status === input.targetGroup);
          }
        }
        
        // Send emails
        let successCount = 0;
        let failCount = 0;
        
        for (const user of targetUsers) {
          if (user.email) {
            try {
              await sendEmail({
                to: user.email,
                subject: input.subject,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); padding: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0;">Meslegim.tr</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Kariyer Değerlendirme Platformu</p>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Merhaba ${user.name},
                      </p>
                      <div style="color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                        ${input.message}
                      </div>
                    </div>
                    <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                      <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
                      <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
                    </div>
                  </div>
                `,
              });
              successCount++;
            } catch (error) {
              console.error(`Failed to send email to ${user.email}:`, error);
              failCount++;
            }
          }
        }
        
        return {
          success: true,
          totalTargeted: targetUsers.length,
          successCount,
          failCount,
        };
      }),
    
    bulkActivateStudents: adminProcedure
      .input(z.object({
        studentIds: z.array(z.number()).optional(),
        activateAll: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let studentsToActivate: number[] = [];
        
        if (input.activateAll) {
          const users = await db.getAllUsers();
          const pendingStudents = users.filter(u => hasRole(u.role, 'student') && u.status === 'pending');
          studentsToActivate = pendingStudents.map(s => s.id);
        } else if (input.studentIds) {
          studentsToActivate = input.studentIds;
        }
        
        let successCount = 0;
        let failCount = 0;
        
        for (const studentId of studentsToActivate) {
          try {
            await db.updateUser(studentId, { status: 'active' });
            
            // Send activation email
            const student = await db.getUserById(studentId);
            if (student?.email && student?.name) {
              try {
                const loginUrl = `${getBaseUrl(ctx.req)}/login`;
                await sendEmail({
                  to: student.email,
                  subject: '🎉 Başvurunuz Onaylandı - Meslegim.tr',
                  html: getApprovalEmailTemplate(student.name, loginUrl),
                });
              } catch (error) {
                console.error('Failed to send activation email:', error);
              }
            }
            
            successCount++;
          } catch (error) {
            console.error(`Failed to activate student ${studentId}:`, error);
            failCount++;
          }
        }
        
        return {
          success: true,
          totalTargeted: studentsToActivate.length,
          successCount,
          failCount,
        };
      }),
    
    createMentor: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Bu e-posta adresi zaten kayıtlı' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        // Create new mentor with active status
        const newMentor = await db.createUser({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: 'mentor',
          status: 'active',
          loginMethod: 'email',
        });
        
        return { success: true, mentorId: newMentor.id };
      }),
    
    getStages: adminProcedure.query(async () => {
      return await db.getAllStages();
    }),
    
    getQuestions: adminProcedure
      .input(z.object({ stageId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        if (input?.stageId) {
          return await db.getQuestionsByStage(input.stageId);
        }
        return await db.getAllQuestions();
      }),
    
    getMentorComparison: adminProcedure.query(async () => {
      return await db.getMentorComparison();
    }),
    
    getAllFeedbacks: adminProcedure.query(async () => {
      return await db.getAllFeedbacks();
    }),

    getAllFeedbacksWithStats: adminProcedure.query(async () => {
      return await db.getAllFeedbacksWithStats();
    }),

    // Platform Settings
    getPlatformSettings: adminProcedure.query(async () => {
      return await db.getAllPlatformSettings();
    }),

    getPlatformSetting: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await db.getPlatformSetting(input.key);
        return { key: input.key, value };
      }),

    setPlatformSetting: adminProcedure
      .input(z.object({
        key: z.string().min(1),
        value: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.setPlatformSetting(input.key, input.value, input.description);
        return { success: true };
      }),

    // Instant stage unlock
    unlockStageNow: adminProcedure
      .input(z.object({
        userId: z.number(),
        userStageId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.unlockStageNow(input.userId, input.userStageId);
        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Kilitli etap bulunamadı veya zaten aktif' });
        }
        // Send email notification
        if (result.userEmail && result.userName) {
          try {
            const { getNewStageActivatedEmailTemplate } = await import('./services/emailService');
            const emailHtml = getNewStageActivatedEmailTemplate(result.userName, result.stageName);
            await sendEmail({
              to: result.userEmail,
              subject: `🔓 Etabınız Açıldı: ${result.stageName}`,
              html: emailHtml,
            });
          } catch (e) {
            console.warn('[Admin] Email notification failed:', e);
          }
        }
        // Write audit log
        await db.logStageUnlock({
          unlockedByUserId: ctx.user.id,
          unlockedByRole: ctx.user.role,
          studentId: input.userId,
          stageId: result.stageId,
          stageName: result.stageName,
          studentName: result.userName,
        });

        // Create in-app + push notification for student
        try {
          const { notify } = await import('./services/notificationService');
          await notify({
            userId: input.userId,
            title: '🔓 Yeni Etabınız Açıldı!',
            message: `"${result.stageName}" etabı admin tarafından açıldı. Hemen başlayabilirsiniz!`,
            event: 'stage_activation',
            link: '/dashboard/student',
            pushPayload: {
              body: `"${result.stageName}" etabı açıldı. Hemen başlayabilirsiniz!`,
              url: '/dashboard/student',
              tag: `stage-unlocked-${result.stageId}`,
            },
          });
        } catch (notifErr) {
          console.error('Failed to create unlock notification:', notifErr);
        }

        return { success: true, stageName: result.stageName };
      }),

    // Get students with locked stages
    getStudentsWithLockedStages: adminProcedure.query(async () => {
      return await db.getStudentsWithLockedStages();
    }),

    // Get locked stages for a specific user
    getLockedStagesForUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLockedStagesForUser(input.userId);
      }),

    // Get stage unlock audit logs
    getStageUnlockLogs: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).optional(),
        role: z.enum(['admin', 'mentor']).optional(),
        studentName: z.string().optional(),
        studentId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getStageUnlockLogs({
          limit: input?.limit,
          role: input?.role,
          studentName: input?.studentName,
          studentId: input?.studentId,
          dateFrom: input?.dateFrom,
          dateTo: input?.dateTo,
        });
      }),

    // Export audit logs as CSV
    exportStageUnlockLogsCsv: adminProcedure
      .input(z.object({
        role: z.enum(['admin', 'mentor']).optional(),
        studentName: z.string().optional(),
        studentId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        const csv = await db.exportStageUnlockLogsCsv({
          role: input?.role,
          studentName: input?.studentName,
          studentId: input?.studentId,
          dateFrom: input?.dateFrom,
          dateTo: input?.dateTo,
        });
        return { csv };
      }),

    // Get notification preferences
    getNotificationPrefs: adminProcedure.query(async () => {
      const keys = [
        'notif_on_mentor_unlock',
        'notif_on_admin_unlock',
        'notif_on_new_student',
        'notif_on_report_submit',
      ];
      const prefs: Record<string, boolean> = {};
      for (const key of keys) {
        const val = await db.getPlatformSetting(key);
        prefs[key] = val !== 'false'; // default true
      }
      return prefs;
    }),

    // Set notification preference
    setNotificationPref: adminProcedure
      .input(z.object({
        key: z.enum(['notif_on_mentor_unlock', 'notif_on_admin_unlock', 'notif_on_new_student', 'notif_on_report_submit']),
        enabled: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.setPlatformSetting(input.key, String(input.enabled), `Bildirim tercihi: ${input.key}`);
        return { success: true };
      }),

    // Get mentor unlock quota settings
    getMentorUnlockQuota: adminProcedure.query(async () => {
      const daily = await db.getPlatformSettingNumber('mentor_unlock_daily_limit', 0);
      const weekly = await db.getPlatformSettingNumber('mentor_unlock_weekly_limit', 0);
      return { daily, weekly };
    }),

    // Set mentor unlock quota
    setMentorUnlockQuota: adminProcedure
      .input(z.object({
        daily: z.number().min(0).max(100),
        weekly: z.number().min(0).max(500),
      }))
      .mutation(async ({ input }) => {
        await db.setPlatformSetting('mentor_unlock_daily_limit', String(input.daily), 'Mentor günlük etap açma limiti (0 = sınırsız)');
        await db.setPlatformSetting('mentor_unlock_weekly_limit', String(input.weekly), 'Mentor haftalık etap açma limiti (0 = sınırsız)');
        return { success: true };
      }),

    // Send a test reminder email to admin themselves
    sendTestReminderEmail: adminProcedure
      .input(z.object({
        toEmail: z.string().email(),
        daysUntilOpen: z.number().min(1).max(30).default(2),
      }))
      .mutation(async ({ input }) => {
        const { getStageReminderEmailTemplate } = await import('./services/emailService');
        const openDate = new Date();
        openDate.setDate(openDate.getDate() + input.daysUntilOpen);
        const openDateStr = openDate.toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
        const html = getStageReminderEmailTemplate(
          'Test Öğrenci',
          'Etap 2: Kariyer Keşfi',
          input.daysUntilOpen,
          openDateStr
        );
        await sendEmail({
          to: input.toEmail,
          subject: `[TEST] ⏳ Etabınız ${input.daysUntilOpen} gün sonra açılıyor!`,
          html,
        });
        return { success: true };
      }),

    // === Ödeme Yönetimi ===
    getAllPurchases: adminProcedure.query(async () => {
      const dbInstance = await (await import('./db')).getDb();
      if (!dbInstance) return [];
      const { purchases } = await import('../drizzle/schema');
      const { users } = await import('../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      const allPurchases = await dbInstance
        .select({
          id: purchases.id,
          userId: purchases.userId,
          productId: purchases.productId,
          stripeSessionId: purchases.stripeSessionId,
          stripePaymentIntentId: purchases.stripePaymentIntentId,
          status: purchases.status,
          amountInCents: purchases.amountInCents,
          currency: purchases.currency,
          metadata: purchases.metadata,
          createdAt: purchases.createdAt,
          completedAt: purchases.completedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(purchases)
        .leftJoin(users, sql`${purchases.userId} = ${users.id}`)
        .orderBy(sql`${purchases.createdAt} DESC`);
      
      return allPurchases;
    }),

    refundPurchase: adminProcedure
      .input(z.object({
        purchaseId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await (await import('./db')).getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Veritabanı bağlantısı yok' });
        const { purchases } = await import('../drizzle/schema');
        const { users } = await import('../drizzle/schema');
        const { eq, sql } = await import('drizzle-orm');
        
        // Get purchase
        const [purchase] = await dbInstance.select().from(purchases).where(eq(purchases.id, input.purchaseId)).limit(1);
        if (!purchase) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Satın alma kaydı bulunamadı' });
        }
        if (purchase.status === 'refunded') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Bu ödeme zaten iade edilmiş' });
        }
        if (purchase.status !== 'completed') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Sadece tamamlanmış ödemeler iade edilebilir' });
        }
        
        // Stripe iade işlemi
        if (purchase.stripePaymentIntentId) {
          try {
            const { getStripe } = await import('./stripeWebhook');
            const stripe = getStripe();
            await stripe.refunds.create({
              payment_intent: purchase.stripePaymentIntentId,
              reason: 'requested_by_customer',
            });
          } catch (stripeErr: any) {
            console.error('[Admin Refund] Stripe refund failed:', stripeErr);
            throw new TRPCError({ 
              code: 'INTERNAL_SERVER_ERROR', 
              message: `Stripe iade başarısız: ${stripeErr.message}` 
            });
          }
        }
        
        // DB'de status'u refunded yap
        await dbInstance.update(purchases)
          .set({ status: 'refunded' })
          .where(eq(purchases.id, input.purchaseId));
        
        // Kullanıcının paketini düşür (eğer paket satın almasıysa)
        const packageProducts = ['basic_package', 'professional_package', 'enterprise_package'];
        if (packageProducts.includes(purchase.productId)) {
          // Kullanıcının başka aktif paketi var mı kontrol et
          const otherPurchases = await dbInstance.select().from(purchases)
            .where(sql`${purchases.userId} = ${purchase.userId} AND ${purchases.status} = 'completed' AND ${purchases.id} != ${input.purchaseId} AND ${purchases.productId} IN ('basic_package', 'professional_package', 'enterprise_package')`);
          
          if (otherPurchases.length === 0) {
            // Başka paketi yok, free'ye düşür
            await dbInstance.update(users)
              .set({ purchasedPackage: 'free' })
              .where(eq(users.id, purchase.userId));
          }
        }
        
        // Audit log
        // console.log(`[Admin Refund] Purchase #${input.purchaseId} refunded by admin ${ctx.user.id}. Reason: ${input.reason || 'N/A'}`);
        
        return { success: true, message: 'İade başarıyla gerçekleştirildi' };
      }),

    getPurchaseStats: adminProcedure.query(async () => {
      const dbInstance = await (await import('./db')).getDb();
      if (!dbInstance) return { totalRevenue: 0, totalPurchases: 0, completedPurchases: 0, refundedPurchases: 0, pendingPurchases: 0 };
      const { purchases } = await import('../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      const [stats] = await dbInstance.select({
        totalPurchases: sql<number>`COUNT(*)`,
        completedPurchases: sql<number>`SUM(CASE WHEN ${purchases.status} = 'completed' THEN 1 ELSE 0 END)`,
        refundedPurchases: sql<number>`SUM(CASE WHEN ${purchases.status} = 'refunded' THEN 1 ELSE 0 END)`,
        pendingPurchases: sql<number>`SUM(CASE WHEN ${purchases.status} = 'pending' THEN 1 ELSE 0 END)`,
        totalRevenue: sql<number>`SUM(CASE WHEN ${purchases.status} = 'completed' THEN ${purchases.amountInCents} ELSE 0 END)`,
      }).from(purchases);
      
      return {
        totalPurchases: Number(stats?.totalPurchases || 0),
        completedPurchases: Number(stats?.completedPurchases || 0),
        refundedPurchases: Number(stats?.refundedPurchases || 0),
        pendingPurchases: Number(stats?.pendingPurchases || 0),
        totalRevenue: Number(stats?.totalRevenue || 0),
      };
    }),

    // ============================================
    // ANALYTICS PROCEDURES
    // ============================================
    
    getDashboardKPIs: adminProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const start = input?.startDate ? new Date(input.startDate) : undefined;
        const end = input?.endDate ? new Date(input.endDate) : undefined;
        return await db.getDashboardKPIs(start, end);
      }),
    
    getDailyRegistrations: adminProcedure
      .input(z.object({
        days: z.number().optional().default(30),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getDailyRegistrations(input.days, start, end);
      }),
    
    getMonthlyRevenue: adminProcedure
      .input(z.object({
        months: z.number().optional().default(12),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getMonthlyRevenue(input.months, start, end);
      }),
    
    getDailyRevenue: adminProcedure
      .input(z.object({
        days: z.number().optional().default(30),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getDailyRevenue(input.days, start, end);
      }),
    
    getStageCompletionStats: adminProcedure.query(async () => {
      return await db.getStageCompletionStats();
    }),
    
    getUserActivitySummary: adminProcedure.query(async () => {
      return await db.getUserActivitySummary();
    }),
    
    getReportGenerationStats: adminProcedure
      .input(z.object({
        months: z.number().optional().default(6),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const start = input.startDate ? new Date(input.startDate) : undefined;
        const end = input.endDate ? new Date(input.endDate) : undefined;
        return await db.getReportGenerationStats(input.months, start, end);
      }),
    
    getPackageDistribution: adminProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const start = input?.startDate ? new Date(input.startDate) : undefined;
        const end = input?.endDate ? new Date(input.endDate) : undefined;
        return await db.getPackageDistribution(start, end);
      }),

    // CSV Export Log procedures
    logCsvExport: adminProcedure
      .input(z.object({
        exportType: z.string(),
        fileName: z.string(),
        recordCount: z.number().optional(),
        dateFilterPreset: z.string().optional(),
        dateFilterStart: z.string().optional(),
        dateFilterEnd: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.logCsvExport({
          userId: ctx.user.id,
          exportType: input.exportType,
          fileName: input.fileName,
          recordCount: input.recordCount,
          dateFilterPreset: input.dateFilterPreset,
          dateFilterStart: input.dateFilterStart ? new Date(input.dateFilterStart) : undefined,
          dateFilterEnd: input.dateFilterEnd ? new Date(input.dateFilterEnd) : undefined,
        });
        return { success: true };
      }),

    getCsvExportLogs: adminProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        const [logs, total] = await Promise.all([
          db.getCsvExportLogs(limit, offset),
          db.getCsvExportLogCount(),
        ]);
        return { logs, total };
      }),
  }),

  // Mentor procedures
  mentor: router({
    getPendingStudents: mentorProcedure.query(async ({ ctx }) => {
      // Mentors see only their assigned students, admins see all
      const mentorId = hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') ? ctx.user.id : undefined;
      const pending = await db.getPendingStudents(mentorId);
      return pending.map(({ password: _, ...safe }) => safe);
    }),
    
    activateStudent: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verify the student is assigned to this mentor (unless admin)
        if (hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin')) {
          const student = await db.getUserById(input.studentId);
          if (!student || student.mentorId !== ctx.user.id) {
            throw new TRPCError({ 
              code: 'FORBIDDEN', 
              message: 'Yalnızca kendi öğrencilerinizi aktive edebilirsiniz' 
            });
          }
        }
        
        await db.updateUser(input.studentId, { status: 'active' });
        
        // Get student details for email
        const student = await db.getUserById(input.studentId);
        
        // Initialize user stages for the student
        if (student && student.ageGroup) {
          // Get all stages for this age group
          const ageGroupStages = await db.getStagesByAgeGroup(student.ageGroup);
          
          // Create user_stages records for all stages
          for (const stage of ageGroupStages) {
            const isFirstStage = stage.order === 1;
            await db.createUserStage({
              userId: student.id,
              stageId: stage.id,
              status: isFirstStage ? 'active' : 'locked',
            });
          }
        }
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
        }
        
        // Send activation email
        if (student.email && student.name) {
          try {
            const loginUrl = `${getBaseUrl(ctx.req)}/login`;
            await sendEmail({
              to: student.email,
              subject: '🎉 Başvurunuz Onaylandı - Meslegim.tr',
              html: getApprovalEmailTemplate(student.name, loginUrl),
            });
          } catch (error) {
            console.error('Failed to send activation email:', error);
            // Don't fail the activation if email fails
          }
        }
        
        return { success: true };
      }),
    
    getMyStudents: mentorProcedure.query(async ({ ctx }) => {
      if (hasRole(ctx.user.role, 'admin')) {
        // Admins see all students
        return (await db.getAllUsers()).filter(u => hasRole(u.role, 'student'));
      }
      const students = await db.getStudentsByMentor(ctx.user.id);
      return students.map(({ password: _, ...safe }) => safe);
    }),
    
    getStudentDetails: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Öğrenci bulunamadı' });
        }
        
        // Verify access
        if (hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') && student.mentorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const stages = await db.getUserStages(student.id);
        const reports = await db.getReportsByUser(student.id);
        const progress = await db.calculateStudentProgress(student.id);
        const unlockLogs = await db.getStageUnlockLogs({ studentId: input.studentId, limit: 50 });
        
        return { student, stages, reports, progress, unlockLogs };
      }),
    
    initiateStudentStages: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Öğrenci bulunamadı' });
        }
        
        // Verify access
        if (hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') && student.mentorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Yalnızca kendi öğrencilerinizin etaplarını başlatabilirsiniz' });
        }
        
        // Check if student has an age group
        if (!student.ageGroup) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Öğrencinin yaş grubu tanımlı değil' });
        }
        
        // Check if stages already exist for this student
        const existingStages = await db.getUserStages(student.id);
        if (existingStages.length > 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Öğrencinin etapları zaten başlatılmış' });
        }
        
        // Get all stages for student's age group
        const stages = await db.getStagesByAgeGroup(student.ageGroup);
        if (stages.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bu yaş grubu için etap bulunamadı' });
        }
        
        // Create user_stages entries - first stage active, rest locked
        const sortedStages = stages.sort((a, b) => a.order - b.order);
        for (let i = 0; i < sortedStages.length; i++) {
          const stage = sortedStages[i];
          await db.createUserStage({
            userId: student.id,
            stageId: stage.id,
            status: i === 0 ? 'active' : 'locked', // First stage active, rest locked
          });
        }
        
        return { success: true, stagesCreated: stages.length };
      }),
    
    getPendingReports: mentorProcedure.query(async ({ ctx }) => {
      const mentorId = hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') ? ctx.user.id : undefined;
      return await db.getPendingReports(mentorId);
    }),
    
    approveReport: mentorProcedure
      .input(z.object({ 
        reportId: z.number(),
        approved: z.boolean().optional().default(true),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get report details
        const report = await db.getReportById(input.reportId);
        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rapor bulunamadı' });
        }
        
        // Approve or reject the report
        if (input.approved) {
          await db.approveReport(input.reportId, ctx.user.id);
        } else {
          // Reject the report - update status to 'rejected' and save feedback
          await db.updateReport(input.reportId, { 
            status: 'rejected',
            mentorFeedback: input.feedback || 'Mentor tarafından reddedildi'
          });
          // Unlock the stage so student can redo it
          if (report.stageId && report.userId) {
            await db.updateUserStage(report.userId, report.stageId, 'active');
          }
        }
        
        // Get student and stage details for email
        const student = report.userId ? await db.getUserById(report.userId) : null;
        const stage = report.stageId ? await db.getStageById(report.stageId) : null;
        
        // Send email (approval or rejection)
        if (student?.email && student?.name && stage?.name) {
          try {
            const reportUrl = `${getBaseUrl(ctx.req)}/reports/${report.id}`;
            const subject = input.approved 
              ? '✅ Raporunuz Onaylandı - Meslegim.tr'
              : '⚠️ Raporunuz İnceleme Bekliyor - Meslegim.tr';
            const html = input.approved
              ? getReportApprovedEmailTemplate(student.name, stage.name, reportUrl)
              : getReportRejectedEmailTemplate(student.name, stage.name, input.feedback || 'Mentor tarafından geri bildirim verilmedi.', reportUrl);
            await sendEmail({
              to: student.email,
              subject,
              html,
            });
          } catch (error) {
            console.error('Failed to send report email:', error);
            // Don't fail the operation if email fails
          }
        }
        
        // Create in-app + push notification for student
        if (report.userId) {
          try {
            const { notify } = await import('./services/notificationService');
            const title = input.approved ? '✅ Raporunuz Onaylandı!' : '⚠️ Raporunuz İnceleme Bekliyor';
            const message = input.approved 
              ? `"${stage?.name || 'Etap'}" raporunuz mentorünüz tarafından onaylandı. PDF olarak indirebilirsiniz.`
              : `"${stage?.name || 'Etap'}" raporunuz için geri bildirim verildi: ${input.feedback || 'Lütfen tekrar inceleyin.'}`;
            await notify({
              userId: report.userId,
              title,
              message,
              event: input.approved ? 'report_approved' : 'report_rejected',
              link: '/dashboard/student/reports',
              pushPayload: {
                body: message,
                url: '/dashboard/student/reports',
                tag: `report-review-${input.reportId}`,
              },
            });
          } catch (notifErr) {
            console.error('Failed to create notification:', notifErr);
          }
        }
        
        return { success: true };
      }),
    
    // Mentor Performance Statistics
    getMyStats: mentorProcedure.query(async ({ ctx }) => {
      return await db.getMentorStats(ctx.user.id);
    }),
    
    getPerformanceTrends: mentorProcedure.query(async ({ ctx }) => {
      return await db.getMentorPerformanceTrends(ctx.user.id);
    }),
    
    // Mentor Notes endpoints
    getNotesByStudent: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify access
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Öğrenci bulunamadı' });
        }
        
        if (hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') && student.mentorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.getMentorNotesByStudent(input.studentId);
      }),
    
    createNote: mentorProcedure
      .input(z.object({ studentId: z.number(), note: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        // Verify access
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Öğrenci bulunamadı' });
        }
        
        if (hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') && student.mentorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return await db.createMentorNote({
          mentorId: ctx.user.id,
          studentId: input.studentId,
          note: input.note,
        });
      }),
    
    updateNote: mentorProcedure
      .input(z.object({ noteId: z.number(), note: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const note = await db.getMentorNoteById(input.noteId);
        if (!note) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Not bulunamadı' });
        }
        
        if (note.mentorId !== ctx.user.id && !hasRole(ctx.user.role, 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.updateMentorNote(input.noteId, input.note);
        return { success: true };
      }),
    
    deleteNote: mentorProcedure
      .input(z.object({ noteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const note = await db.getMentorNoteById(input.noteId);
        if (!note) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Not bulunamadı' });
        }
        
        if (note.mentorId !== ctx.user.id && !hasRole(ctx.user.role, 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.deleteMentorNote(input.noteId);
        return { success: true };
      }),
    
    // Messaging endpoints
    sendMessage: mentorProcedure
      .input(z.object({ receiverId: z.number(), message: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        return await db.sendMessage({
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          message: input.message,
        });
      }),
    
    getConversation: mentorProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getConversation(ctx.user.id, input.otherUserId);
      }),
    
    markMessagesAsRead: mentorProcedure
      .input(z.object({ otherUserId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.markMessagesAsRead(ctx.user.id, input.otherUserId);
        return { success: true };
      }),
    
    getUnreadCount: mentorProcedure.query(async ({ ctx }) => {
      return await db.getUnreadCount(ctx.user.id);
    }),
    
    // Feedback endpoints
    getMyFeedbacks: mentorProcedure.query(async ({ ctx }) => {
      return await db.getFeedbacksByMentor(ctx.user.id);
    }),
    
    getFeedbackStats: mentorProcedure.query(async ({ ctx }) => {
      return await db.getMentorFeedbackStats(ctx.user.id);
    }),

    // Get locked stages for mentor's own students
    getMyStudentsWithLockedStages: mentorProcedure.query(async ({ ctx }) => {
      if (hasRole(ctx.user.role, 'admin')) {
        return await db.getStudentsWithLockedStages();
      }
      // Mentor: only their assigned students
      const myStudents = await db.getStudentsByMentor(ctx.user.id);
      const result = [];
      for (const student of myStudents) {
        const lockedStages = await db.getLockedStagesForUser(student.id);
        if (lockedStages.length > 0) {
          result.push({
            userId: student.id,
            userName: student.name,
            userEmail: student.email,
            ageGroup: student.ageGroup,
            lockedStages,
          });
        }
      }
      return result;
    }),

    // Instantly unlock a locked stage for a student (mentor can only unlock own students)
    unlockStudentStage: mentorProcedure
      .input(z.object({
        userId: z.number(),
        userStageId: z.number(),
        note: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership: mentor can only unlock their own students
        if (!hasRole(ctx.user.role, 'admin')) {
          const student = await db.getUserById(input.userId);
          if (!student || student.mentorId !== ctx.user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Yalnızca kendi öğrencilerinizin etaplarını açabilirsiniz',
            });
          }

          // Quota check (skip for admins)
          const dailyLimit = await db.getPlatformSettingNumber('mentor_unlock_daily_limit', 0);
          const weeklyLimit = await db.getPlatformSettingNumber('mentor_unlock_weekly_limit', 0);

          if (dailyLimit > 0) {
            const dayStart = new Date();
            dayStart.setHours(0, 0, 0, 0);
            const dailyCount = await db.getMentorUnlockCount(ctx.user.id, dayStart);
            if (dailyCount >= dailyLimit) {
              throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Günlük etap açma limitine ulaştınız (${dailyLimit} açma/gün). Yarın tekrar deneyebilirsiniz.`,
              });
            }
          }

          if (weeklyLimit > 0) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weeklyCount = await db.getMentorUnlockCount(ctx.user.id, weekStart);
            if (weeklyCount >= weeklyLimit) {
              throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Haftalık etap açma limitine ulaştınız (${weeklyLimit} açma/hafta). Gelecek hafta tekrar deneyebilirsiniz.`,
              });
            }
          }
        }

        const result = await db.unlockStageNow(input.userId, input.userStageId);
        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Kilitli etap bulunamadı veya zaten aktif' });
        }

        // Write audit log
        await db.logStageUnlock({
          unlockedByUserId: ctx.user.id,
          unlockedByRole: ctx.user.role,
          studentId: input.userId,
          stageId: result.stageId,
          stageName: result.stageName,
          studentName: result.userName,
          note: input.note,
        });

        // Send email notification to student
        if (result.userEmail && result.userName) {
          try {
            const { getNewStageActivatedEmailTemplate } = await import('./services/emailService');
            const emailHtml = getNewStageActivatedEmailTemplate(result.userName, result.stageName);
            await sendEmail({
              to: result.userEmail,
              subject: `🔓 Etabınız Açıldı: ${result.stageName}`,
              html: emailHtml,
            });
          } catch (e) {
            console.warn('[Mentor] Email notification failed:', e);
          }
        }

        // Notify admin about the manual unlock (respect notification preferences)
        try {
          const notifEnabled = await db.getPlatformSetting('notif_on_mentor_unlock');
          if (notifEnabled !== 'false') {
            const mentorName = ctx.user.name ?? `Mentor #${ctx.user.id}`;
            const studentName = result.userName ?? `Öğrenci #${input.userId}`;
            await notifyOwner({
              title: `🔓 Manuel Etap Açma: ${result.stageName}`,
              content: `**${mentorName}** (Mentor), **${studentName}** adlı öğrencinin "${result.stageName}" etabını manuel olarak açtı.${input.note ? `\n\n**Not:** ${input.note}` : ''}`,
            });
          }
        } catch (e) {
          // Notification failure should not block the unlock operation
          console.warn('[Mentor] Admin notification failed:', e);
        }

         // Create in-app + push notification for student
        try {
          const { notify } = await import('./services/notificationService');
          await notify({
            userId: input.userId,
            title: '🔓 Yeni Etabınız Açıldı!',
            message: `"${result.stageName}" etabı mentorünüz tarafından açıldı. Hemen başlayabilirsiniz!`,
            event: 'stage_activation',
            link: '/dashboard/student',
            pushPayload: {
              body: `"${result.stageName}" etabı açıldı. Hemen başlayabilirsiniz!`,
              url: '/dashboard/student',
              tag: `stage-unlocked-${result.stageId}`,
            },
          });
        } catch (notifErr) {
          console.error('Failed to create unlock notification:', notifErr);
        }
        return { success: true, stageName: result.stageName };
      }),
    // Get stage unlock audit logs for mentor's students
    getMyUnlockLogs: mentorProcedure.query(async ({ ctx }) => {
      if (hasRole(ctx.user.role, 'admin')) {
        return await db.getStageUnlockLogs();
      }
      return await db.getStageUnlockLogs({ mentorId: ctx.user.id });
    }),
  }),

  // Student procedures
  student: router({
    getMyProgress: studentProcedure.query(async ({ ctx }) => {
      const userStages = await db.getUserStages(ctx.user.id);
      const allStages = await db.getAllStages();
      
      // Join userStages with stages to get stage details
      const progress = userStages.map(us => {
        const stage = allStages.find(s => s.id === us.stageId);
        return {
          ...us,
          stageName: stage?.name || '',
          stageDescription: stage?.description || '',
        };
      });
      
      return progress;
    }),
    
    getActiveStage: studentProcedure.query(async ({ ctx }) => {
      const userStage = await db.getActiveStage(ctx.user.id);
      if (!userStage) {
        return null;
      }
      
      const allStages = await db.getAllStages();
      const stage = allStages.find(s => s.id === userStage.stageId);
      
      const questions = await db.getQuestionsByStage(userStage.stageId);
      const answers = await db.getAnswersByUserAndStage(ctx.user.id, userStage.stageId);
      
      
      return {
        ...userStage,
        stageName: stage?.name || '',
        stageDescription: stage?.description || '',
        questions,
        answers,
      };
    }),
    
    saveAnswer: studentProcedure
      .input(z.object({
        questionId: z.number(),
        answer: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.saveAnswer(ctx.user.id, input.questionId, input.answer);
        return { success: true };
      }),
    
    submitStage: studentProcedure
      .input(z.object({ stageId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { stageId } = input;
        const userId = ctx.user.id;
        
        // Validate all required questions are answered
        const questions = await db.getQuestionsByStage(stageId);
        const answers = await db.getAnswersByUserAndStage(userId, stageId);
        
        const requiredQuestions = questions.filter(q => q.required);
        const answeredQuestionIds = answers.map(a => a.questionId);
        const unanswered = requiredQuestions.filter(q => !answeredQuestionIds.includes(q.id));
        
        if (unanswered.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Lütfen tüm zorunlu soruları cevaplayın (${unanswered.length} soru kaldı)`,
          });
        }
        
        // Mark stage as completed
        await db.updateUserStage(userId, stageId, 'completed');
        
        // Trigger report generation (async, don't wait)
        generateStageReportAsync(userId, stageId).catch(err => {
          console.error('Report generation failed:', err);
        });
        
        // Schedule next stage activation (7 days from now)
        await db.scheduleNextStage(userId, stageId);
        
        // Send notification to mentor (async, don't wait)
        const student = await db.getUserById(userId);
        const stage = await db.getStageById(stageId);
        if (student && student.mentorId && stage) {
          const mentor = await db.getUserById(student.mentorId);
          if (mentor && mentor.email) {
            sendEmail({
              to: mentor.email,
              subject: `🎉 ${student.name} bir etabı tamamladı!`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4F46E5;">🎉 Etap Tamamlandı!</h2>
                  <p>Merhaba ${mentor.name},</p>
                  <p>Öğrenciniz <strong>${student.name}</strong> bir etabı başarıyla tamamladı!</p>
                  <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Etap:</strong> ${stage.name}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Tamamlanma Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
                  </div>
                  <p>Öğrencinin ilerlemesini kontrol etmek ve raporu onaylamak için lütfen platforma giriş yapın.</p>
                  <a href="${getBaseUrl(ctx.req)}/dashboard/mentor" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                    Mentor Paneline Git
                  </a>
                  <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                    Bu bir otomatik bildirimdir. Lütfen yanıtlamayın.
                  </p>
                </div>
              `,
            }).catch(err => {
              console.error('Failed to send mentor notification:', err);
            });
          }
        }
        
        // Create in-app + push notification for student and mentor
        try {
          const { notify } = await import('./services/notificationService');
          await notify({
            userId,
            title: '🎉 Etap Tamamlandı!',
            message: `${stage?.name || 'Etap'} başarıyla tamamlandı. Raporunuz hazırlanıyor...`,
            event: 'report_ready',
            link: '/dashboard/student/reports',
            pushPayload: {
              body: `${stage?.name || 'Etap'} başarıyla tamamlandı. Raporunuz hazırlanıyor...`,
              url: '/dashboard/student/reports',
              tag: `stage-completed-${stageId}`,
            },
          });
          // Notify mentor
          if (student && student.mentorId) {
            await notify({
              userId: student.mentorId,
              title: '📚 Öğrenci Etap Tamamladı',
              message: `${student.name} "${stage?.name || 'Etap'}" etabını tamamladı. Raporu incelemeyi unutmayın.`,
              event: 'report_ready',
              link: '/dashboard/mentor/students',
              pushPayload: {
                body: `${student.name} "${stage?.name || 'Etap'}" etabını tamamladı.`,
                url: '/dashboard/mentor/students',
                tag: `student-completed-${stageId}`,
              },
            });
          }
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr);
        }
        
        // Auto-check badges after stage completion
        try {
          await checkAndAwardBadges(userId);
        } catch (badgeErr) {
          console.error('Badge check failed:', badgeErr);
        }
        
        return { success: true, message: 'Etap başarıyla tamamlandı!' };
      }),
    
    getMyReports: studentProcedure.query(async ({ ctx }) => {
      return await db.getReportsByUser(ctx.user.id);
    }),
    
    generateReportPDF: studentProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const report = await db.getReportById(input.reportId);
        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rapor bulunamadı' });
        }
        if (report.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu raporu görüntüleme yetkiniz yok' });
        }
        if (report.status !== 'approved') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sadece onaylanmış raporlar için PDF oluşturulabilir' });
        }
        
        // Generate PDF
        const pdfUrl = await generatePDF(
          report.content || 'Rapor içeriği henüz hazır değil.',
          'Kariyer Değerlendirme Raporu',
          ctx.user.name || 'Öğrenci'
        );
        
        // Update report with PDF URL
        await db.updateReport(input.reportId, { fileUrl: pdfUrl });
        
        return { pdfUrl };
      }),
    
    getReport: studentProcedure
      .input(z.object({ reportId: z.number() }))
      .query(async ({ input, ctx }) => {
        const report = await db.getReportById(input.reportId);
        if (!report || report.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rapor bulunamadı' });
        }
        return report;
      }),
    
    // Messaging endpoints
    sendMessage: studentProcedure
      .input(z.object({ receiverId: z.number(), message: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        return await db.sendMessage({
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          message: input.message,
        });
      }),
    
    getConversation: studentProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getConversation(ctx.user.id, input.otherUserId);
      }),
    
    markMessagesAsRead: studentProcedure
      .input(z.object({ otherUserId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.markMessagesAsRead(ctx.user.id, input.otherUserId);
        return { success: true };
      }),
    
    getUnreadCount: studentProcedure.query(async ({ ctx }) => {
      return await db.getUnreadCount(ctx.user.id);
    }),
    
    // Feedback endpoints
    submitFeedback: studentProcedure
      .input(z.object({
        mentorId: z.number(),
        reportId: z.number().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const feedback = await db.createFeedback({
          studentId: ctx.user.id,
          mentorId: input.mentorId,
          reportId: input.reportId,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true, feedback };
      }),
    
    getMyFeedbacks: studentProcedure.query(async ({ ctx }) => {
      return await db.getFeedbacksByStudent(ctx.user.id);
    }),

    // Dashboard endpoints
    getDashboardStats: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentDashboardStats(ctx.user.id);
    }),

    getStagesWithProgress: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentStagesWithProgress(ctx.user.id);
    }),

    // Certificate endpoints
    checkCertificateEligibility: studentProcedure.query(async ({ ctx }) => {
      return await db.checkCertificateEligibility(ctx.user.id);
    }),

    getMyCertificate: studentProcedure.query(async ({ ctx }) => {
      return await db.getCertificateByStudent(ctx.user.id);
    }),

    generateCertificate: studentProcedure.mutation(async ({ ctx }) => {
      // Check eligibility
      const isEligible = await db.checkCertificateEligibility(ctx.user.id);
      if (!isEligible) {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Tüm etapları tamamlamanız gerekiyor' 
        });
      }

      // Create certificate record
      const certificate = await db.createCertificate(ctx.user.id);

      // Send certificate ready email
      if (ctx.user.email && ctx.user.name) {
        try {
          const certificateUrl = `${getBaseUrl(ctx.req)}/dashboard`;
          const { getCertificateReadyEmailTemplate } = await import('./_core/resend-email');
          await sendEmail({
            to: ctx.user.email,
            subject: '🎓 Sertifikanız Hazır - Meslegim.tr',
            html: getCertificateReadyEmailTemplate(ctx.user.name, certificateUrl),
          });
        } catch (error) {
          console.error('Failed to send certificate email:', error);
          // Don't fail the operation if email fails
        }
      }

      return certificate;
    }),

    getMyRIASECProfile: studentProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      // Get all completed stages for this user
      const allStages = await db.getAllUserStages();
      const completedStages = allStages.filter(s => s.userId === userId && s.status === 'completed');
      
      if (completedStages.length === 0) {
        return null;
      }
      
      // Collect all answers from completed stages
      const allAnswers: Array<{ question: string; answer: string }> = [];
      for (const us of completedStages) {
        const stageAnswers = await db.getAnswersByUserAndStage(userId, us.stageId);
        const stageQuestions = await db.getQuestionsByStage(us.stageId);
        for (const q of stageQuestions) {
          const ans = stageAnswers.find(a => a.questionId === q.id);
          if (ans) {
            allAnswers.push({ question: q.text, answer: ans.answer || '' });
          }
        }
      }
      
      if (allAnswers.length === 0) {
        return null;
      }
      
      const { performFullAnalysis } = await import('./services/riasecAnalyzer');
      return performFullAnalysis(allAnswers);
    }),

    getCareerProfileSummary: studentProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      // Get all completed stages for this user
      const allUserStages = await db.getAllUserStages();
      const completedStages = allUserStages.filter(s => s.userId === userId && s.status === 'completed');
      
      if (completedStages.length === 0) {
        return null;
      }
      
      // Get stage details and collect answers per stage
      const allStages = await db.getAllStages();
      const stageAnswersList: Array<{ stageId: number; stageName: string; answers: Array<{ question: string; answer: string }> }> = [];
      
      for (const us of completedStages) {
        const stage = allStages.find(s => s.id === us.stageId);
        if (!stage) continue;
        
        const stageQuestions = await db.getQuestionsByStage(us.stageId);
        const stageAnswers = await db.getAnswersByUserAndStage(userId, us.stageId);
        
        const answers = stageQuestions.map(q => {
          const ans = stageAnswers.find(a => a.questionId === q.id);
          return { question: q.text, answer: ans?.answer || '' };
        }).filter(a => a.answer);
        
        if (answers.length > 0) {
          stageAnswersList.push({ stageId: us.stageId, stageName: stage.name, answers });
        }
      }
      
      if (stageAnswersList.length === 0) {
        return null;
      }
      
      const { generateProfileSummary } = await import('./services/profileSummaryAnalyzer');
      return generateProfileSummary(stageAnswersList);
    }),

    generateCareerProfileReport: studentProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const user = await db.getUserById(userId);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'Kullanıcı bulunamadı' });
      
      // Get all completed stages
      const allUserStages = await db.getAllUserStages();
      const completedStages = allUserStages.filter(s => s.userId === userId && s.status === 'completed');
      
      if (completedStages.length < 2) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Kapsamlı rapor için en az 2 etabı tamamlamanız gerekiyor' });
      }
      
      // Collect all stage answers
      const allStages = await db.getAllStages();
      const stageAnswersList: Array<{ stageId: number; stageName: string; answers: Array<{ question: string; answer: string }> }> = [];
      
      for (const us of completedStages) {
        const stage = allStages.find(s => s.id === us.stageId);
        if (!stage) continue;
        const stageQuestions = await db.getQuestionsByStage(us.stageId);
        const stageAnswers = await db.getAnswersByUserAndStage(userId, us.stageId);
        const answers = stageQuestions.map(q => {
          const ans = stageAnswers.find(a => a.questionId === q.id);
          return { question: q.text, answer: ans?.answer || '' };
        }).filter(a => a.answer);
        if (answers.length > 0) {
          stageAnswersList.push({ stageId: us.stageId, stageName: stage.name, answers });
        }
      }
      
      // Generate profile summary
      const { generateProfileSummary, getProfileSummaryContext } = await import('./services/profileSummaryAnalyzer');
      const profileSummary = generateProfileSummary(stageAnswersList);
      const profileContext = getProfileSummaryContext(profileSummary);
      
      // Generate comprehensive report via LLM
      const { generateCareerReport } = await import('./_core/reportGeneration');
      const reportContent = await generateCareerReport({
        studentName: user.name || user.email || 'Öğrenci',
        studentEmail: user.email || '',
        ageGroup: user.ageGroup || '18-21',
        stageAnswers: stageAnswersList.map(s => ({
          stageName: s.stageName,
          questions: s.answers.map((a, i) => ({
            ...a,
            answer: a.answer + (i === s.answers.length - 1 ? profileContext : ''),
          })),
        })),
      });
      
      // Generate PDF
      let fileUrl: string | undefined;
      try {
        const { convertMarkdownToPDF } = await import('./_core/pdfExport');
        const fileName = `career-profile-${userId}-${Date.now()}`;
        const result = await convertMarkdownToPDF(reportContent, fileName);
        fileUrl = result.fileUrl;
      } catch (pdfError) {
        console.error('PDF generation failed for career profile:', pdfError);
      }
      
      // Save as report with type 'comprehensive'
      await db.createReport({
        userId,
        stageId: completedStages[completedStages.length - 1].stageId,
        type: 'comprehensive',
        content: reportContent,
        summary: `${user.name || 'Öğrenci'} - Kapsamlı Kariyer Profili Özeti (${completedStages.length} etap)`,
        status: 'pending',
        fileUrl: fileUrl || null,
        fileKey: null,
      });
      
      // Create notification (in-app + push)
      try {
        const { notify } = await import('./services/notificationService');
        await notify({
          userId,
          title: '📊 Kariyer Profili Raporunuz Hazır!',
          message: 'Kapsamlı kariyer profili özet raporunuz oluşturuldu. Raporlarım sayfasından inceleyebilirsiniz.',
          event: 'report_ready',
          link: '/dashboard/student/reports',
          pushPayload: {
            body: 'Kapsamlı kariyer profili özet raporunuz oluşturuldu.',
            url: '/dashboard/student/reports',
            tag: 'career-report-ready',
          },
        });
      } catch (e) { console.error('Notification failed:', e); }
      
      return { success: true, content: reportContent, fileUrl };
    }),
  }),

  // ========== Pilot Feedback Router ==========
  badge: router({
    // Kullanıcının tüm rozetlerini getir (kazanılan + kilitli)
    getMyBadges: protectedProcedure.query(async ({ ctx }) => {
      const allBadges = await getUserBadgesWithStatus(ctx.user.id);
      const totalXP = await getUserTotalXP(ctx.user.id);
      return { badges: allBadges, totalXP };
    }),

    // Yeni rozet kontrolü yap ve kazanılan rozetleri döndür
    checkNewBadges: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await checkAndAwardBadges(ctx.user.id);
      return result;
    }),

    // Bildirilmemiş rozetleri getir (toast notification için)
    getUnnotified: protectedProcedure.query(async ({ ctx }) => {
      return getUnnotifiedBadges(ctx.user.id);
    }),

    // Rozetleri bildirildi olarak işaretle
    markNotified: protectedProcedure.mutation(async ({ ctx }) => {
      await markBadgesNotified(ctx.user.id);
      return { success: true };
    }),

    // Liderlik tablosu
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
      .query(async ({ input }) => {
        return getLeaderboard(input?.limit ?? 10);
      }),
  }),

  pilotFeedback: router({
    submit: publicProcedure
      .input(z.object({
        npsScore: z.number().min(0).max(10),
        whatWorkedWell: z.string().optional(),
        whatNeedsImprovement: z.string().optional(),
        wouldRecommend: z.boolean().optional(),
        additionalComments: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const userAgent = ctx.req?.headers?.['user-agent'] || undefined;
        const id = await db.createPilotFeedback({
          userId,
          npsScore: input.npsScore,
          whatWorkedWell: input.whatWorkedWell || undefined,
          whatNeedsImprovement: input.whatNeedsImprovement || undefined,
          wouldRecommend: input.wouldRecommend,
          additionalComments: input.additionalComments || undefined,
          userAgent,
        });
        return { success: true, id };
      }),

    // Admin: tüm geri bildirimleri listele
    getAll: adminProcedure.query(async () => {
      return db.getAllPilotFeedbacks();
    }),

    // Admin: NPS istatistikleri
    getStats: adminProcedure.query(async () => {
      return db.getPilotFeedbackStats();
    }),
  }),

  // ==================== STRIPE PAYMENT ====================
  payment: router({
    // Ürünleri ve paketleri listele
    getProducts: publicProcedure.query(() => {
      return {
        packages: getPackages(),
        singleProducts: [
          PRODUCTS.ai_career_report,
          PRODUCTS.single_stage_unlock,
        ],
      };
    }),

    // Kullanıcının mevcut paket bilgisini getir
    getMyAccess: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const userRecord = await db.getUserById(userId);
      const pkg = userRecord?.purchasedPackage || 'free';
      const access = PACKAGE_ACCESS[pkg] || PACKAGE_ACCESS.free;
      const completedPurchases = await db.getUserCompletedPurchases(userId);
      const hasAiReport = completedPurchases.some((p: any) => p.productId === 'ai_career_report') || access.aiReport;
      
      return {
        currentPackage: pkg,
        access: { ...access, aiReport: hasAiReport },
        purchases: completedPurchases,
      };
    }),

    // Stripe Checkout Session oluştur
    createCheckoutSession: protectedProcedure
      .input(z.object({
        productId: z.enum(['basic_package', 'professional_package', 'enterprise_package', 'ai_career_report', 'single_stage_unlock']),
        promotionCode: z.string().optional(),
        metadata: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getStripe } = await import('./stripeWebhook');
        const stripe = getStripe();
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Ödeme sistemi yapılandırılmamış' });
        }
        const product = PRODUCTS[input.productId as ProductId];
        if (!product) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Geçersiz ürün' });
        }

        const userId = ctx.user.id;
        const baseUrl = getBaseUrl(ctx.req);

        // Promotion kodu varsa doğrula ve indirim hesapla
        let finalAmountInCents = product.priceInCents;
        let promoCodeId: number | undefined;
        let promoDiscount = 0;
        if (input.promotionCode) {
          const validation = await db.validatePromotionCode(
            input.promotionCode,
            userId,
            input.productId,
            ctx.user.schoolId || undefined
          );
          if (validation.valid && validation.code) {
            promoCodeId = validation.code.id;
            const dType = validation.code.discountType;
            const dValue = validation.code.discountValue;
            if (dType === 'percentage') {
              promoDiscount = Math.round(finalAmountInCents * dValue / 100);
            } else {
              promoDiscount = dValue * 100; // TL to kuruş
            }
            finalAmountInCents = Math.max(50, finalAmountInCents - promoDiscount); // Min 0.50 TL
          } else {
            throw new TRPCError({ code: 'BAD_REQUEST', message: validation.error || 'Geçersiz promosyon kodu' });
          }
        }

        // Stripe Checkout Session oluştur
        const session = await stripe.checkout.sessions.create({
          locale: 'tr',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: promoDiscount > 0
                  ? `${product.description} (Promosyon indirimi: -${(promoDiscount / 100).toFixed(2)} TL)`
                  : product.description,
              },
              unit_amount: finalAmountInCents,
            },
            quantity: 1,
          }],
          mode: 'payment',
          allow_promotion_codes: !input.promotionCode, // Kendi kodumuz varsa Stripe'in kodlarını kapat
          success_url: `${baseUrl}/dashboard/student?payment=success&product=${input.productId}`,
          cancel_url: `${baseUrl}/fiyatlandirma?payment=cancelled`,
          metadata: {
            user_id: userId.toString(),
            product_id: input.productId,
            promotion_code_id: promoCodeId?.toString() || '',
            original_amount: product.priceInCents.toString(),
            discount_amount: promoDiscount.toString(),
            ...input.metadata,
          },
          customer_email: ctx.user.email || undefined,
          payment_intent_data: {
            statement_descriptor: 'MESLEGIM.TR',
          },
        });

        // Promotion kodu kullanımını kaydet
        if (promoCodeId) {
          await db.usePromotionCode(promoCodeId, userId);
        }

        // Purchase kaydı oluştur
        await db.createPurchase({
          userId,
          productId: input.productId,
          stripeSessionId: session.id,
          amountInCents: finalAmountInCents,
          currency: product.currency,
          metadata: JSON.stringify({
            ...(input.metadata || {}),
            promotionCodeId: promoCodeId,
            originalAmount: product.priceInCents,
            discountAmount: promoDiscount,
          }),
        });

        return { sessionId: session.id, url: session.url };
      }),

    // Ödeme geçmişi
    getMyPurchases: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPurchases(ctx.user.id);
    }),

    // Belirli bir ürün satın alınmış mı kontrol et
    hasProduct: protectedProcedure
      .input(z.object({ productId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.hasUserPurchasedProduct(ctx.user.id, input.productId);
      }),
  }),

  // ==========================================
  // SCHOOL MANAGEMENT ROUTER
  // ==========================================
  school: router({
    // Tüm okulları listele (admin+ seviye)
    getAll: protectedProcedure
      .input(z.object({
        city: z.string().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN', message: 'Yetkiniz yok' });
        // School admin sadece kendi okulunu görür
        if (hasRole(ctx.user.role, 'school_admin') && !isAdminLevel(ctx.user.role)) {
          if (!ctx.user.schoolId) return [];
          const school = await db.getSchoolById(ctx.user.schoolId);
          return school ? [school] : [];
        }
        return db.getAllSchools(input || undefined);
      }),

    // Okul detayı
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        // School admin sadece kendi okulunu görebilir
        if (hasRole(ctx.user.role, 'school_admin') && !isAdminLevel(ctx.user.role)) {
          if (ctx.user.schoolId !== input.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu okula erişim yetkiniz yok' });
        }
        const school = await db.getSchoolById(input.id);
        if (!school) throw new TRPCError({ code: 'NOT_FOUND', message: 'Okul bulunamadı' });
        const stats = await db.getSchoolStats(input.id);
        const mentors = await db.getSchoolMentors(input.id);
        return { ...school, stats, mentors };
      }),

    // Okul oluştur (admin+ seviye)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(2),
        code: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        type: z.string().optional(),
        maxStudents: z.number().optional(),
        maxMentors: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        const id = await db.createSchool(input);
        await db.logActivity({ userId: ctx.user.id, action: 'school.create', entityType: 'school', entityId: id || undefined, details: { name: input.name } });
        return { id };
      }),

    // Okul güncelle
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        maxStudents: z.number().optional(),
        maxMentors: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        if (hasRole(ctx.user.role, 'school_admin') && !isAdminLevel(ctx.user.role)) {
          if (ctx.user.schoolId !== input.id) throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const { id, ...data } = input;
        await db.updateSchool(id, data);
        await db.logActivity({ userId: ctx.user.id, action: 'school.update', entityType: 'school', entityId: id });
        return { success: true };
      }),

    // Okul sil (sadece admin+)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        await db.deleteSchool(input.id);
        await db.logActivity({ userId: ctx.user.id, action: 'school.delete', entityType: 'school', entityId: input.id });
        return { success: true };
      }),

    // Okula mentor ata
    assignMentor: protectedProcedure
      .input(z.object({ schoolId: z.number(), mentorId: z.number(), isPrimary: z.boolean().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        await db.assignMentorToSchool(input.schoolId, input.mentorId, ctx.user.id, input.isPrimary);
        await db.logActivity({ userId: ctx.user.id, action: 'school.assignMentor', entityType: 'school', entityId: input.schoolId, details: { mentorId: input.mentorId } });
        return { success: true };
      }),

    // Okuldan mentor çıkar
    removeMentor: protectedProcedure
      .input(z.object({ schoolId: z.number(), mentorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        await db.removeMentorFromSchool(input.schoolId, input.mentorId);
        await db.logActivity({ userId: ctx.user.id, action: 'school.removeMentor', entityType: 'school', entityId: input.schoolId, details: { mentorId: input.mentorId } });
        return { success: true };
      }),

    // Okul mentorlarını getir
    getMentors: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getSchoolMentors(input.schoolId);
      }),

    // Okul öğrencilerini getir
    getStudents: protectedProcedure
      .input(z.object({
        schoolId: z.number(),
        status: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        const schoolUsers = await db.getUsersBySchool(input.schoolId, { role: 'student', status: input.status, search: input.search });
        return schoolUsers.map(({ password: _, ...safe }) => safe);
      }),

    // Okul istatistikleri
    getStats: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getSchoolStats(input.schoolId);
      }),
  }),

  // ==========================================
  // SUPER ADMIN ROUTER
  // ==========================================
  superAdmin: router({
    // Sistem genel bakış istatistikleri
    getSystemStats: protectedProcedure.query(async ({ ctx }) => {
      if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
      const allUsers = await db.getAdvancedUserList({ limit: 10000 });
      const allSchools = await db.getAllSchools();
      const activityStats = await db.getActivityLogStats();
      
      const usersByRole = {
        super_admin: allUsers.users.filter((u: any) => u.role.includes('super_admin')).length,
        admin: allUsers.users.filter((u: any) => u.role.includes('admin') && !u.role.includes('super_admin')).length,
        school_admin: allUsers.users.filter((u: any) => u.role.includes('school_admin')).length,
        mentor: allUsers.users.filter((u: any) => u.role.includes('mentor')).length,
        student: allUsers.users.filter((u: any) => u.role.includes('student')).length,
      };
      const usersByStatus = {
        active: allUsers.users.filter(u => u.status === 'active').length,
        pending: allUsers.users.filter(u => u.status === 'pending').length,
        inactive: allUsers.users.filter(u => u.status === 'inactive').length,
      };
      return {
        totalUsers: allUsers.total,
        usersByRole,
        usersByStatus,
        totalSchools: allSchools.length,
        activeSchools: allSchools.filter((s: any) => s.status === 'active').length,
        activityStats,
      };
    }),

    // Gelişmiş kullanıcı listesi (filtreleme, arama, sıralama)
    getUsers: protectedProcedure
      .input(z.object({
        role: z.string().optional(),
        status: z.string().optional(),
        schoolId: z.number().optional(),
        mentorId: z.number().optional(),
        ageGroup: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getAdvancedUserList(input || undefined);
      }),

    // Kullanıcı rolü değiştir
    changeUserRole: protectedProcedure
      .input(z.object({ userId: z.number(), newRole: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        // Super admin sadece başka bir super admin tarafından atanabilir
        if (input.newRole.includes('super_admin') && !isSuperAdmin(ctx.user.role)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Süper admin atamak için süper admin olmalısınız' });
        }
        await db.updateUser(input.userId, { role: input.newRole });
        await db.logActivity({ userId: ctx.user.id, action: 'user.changeRole', entityType: 'user', entityId: input.userId, details: { newRole: input.newRole } });
        return { success: true };
      }),

    // Kullanıcıyı okula ata
    assignUserToSchool: protectedProcedure
      .input(z.object({ userId: z.number(), schoolId: z.number().nullable() }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        await db.updateUser(input.userId, { schoolId: input.schoolId } as any);
        await db.logActivity({ userId: ctx.user.id, action: 'user.assignSchool', entityType: 'user', entityId: input.userId, details: { schoolId: input.schoolId } });
        return { success: true };
      }),

    // Aktivite logları
    getActivityLogs: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getActivityLogs(input || undefined);
      }),

    // Aktivite log istatistikleri
    getActivityStats: protectedProcedure.query(async ({ ctx }) => {
      if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
      return db.getActivityLogStats();
    }),

    // Mentor performans detayları
    getMentorPerformance: protectedProcedure
      .input(z.object({ mentorId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getMentorPerformanceStats(input.mentorId);
      }),
  }),

  // ==========================================
  // PROMOTION CODE ROUTER
  // ==========================================
  promotionCode: router({
    // Tüm kodları listele (admin+)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
      return db.getAllPromotionCodes();
    }),

    // Kod oluştur
    create: protectedProcedure
      .input(z.object({
        code: z.string().min(3).max(50),
        description: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed_amount']),
        discountValue: z.number().min(1),
        minPurchaseAmount: z.number().optional(),
        maxUses: z.number().optional(),
        maxUsesPerUser: z.number().optional(),
        applicableProducts: z.array(z.string()).optional(),
        applicableSchools: z.array(z.number()).optional(),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        const id = await db.createPromotionCode({ ...input, createdBy: ctx.user.id });
        await db.logActivity({ userId: ctx.user.id, action: 'promo.create', entityType: 'promotionCode', entityId: id || undefined, details: { code: input.code } });
        return { id };
      }),

    // Kod güncelle
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        maxUses: z.number().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        const { id, ...data } = input;
        await db.updatePromotionCode(id, data);
        await db.logActivity({ userId: ctx.user.id, action: 'promo.update', entityType: 'promotionCode', entityId: id });
        return { success: true };
      }),

    // Kod sil
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        await db.deletePromotionCode(input.id);
        await db.logActivity({ userId: ctx.user.id, action: 'promo.delete', entityType: 'promotionCode', entityId: input.id });
        return { success: true };
      }),

    // Kodu doğrula (public - checkout sırasında kullanılır)
    validate: protectedProcedure
      .input(z.object({ code: z.string(), productId: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return db.validatePromotionCode(input.code, ctx.user.id, input.productId, ctx.user.schoolId || undefined);
      }),
  }),

  // ==========================================
  // SCHOOL ADMIN ROUTER (okul yöneticisi için)
  // ==========================================
  schoolAdmin: router({
    // Kendi okul bilgilerini getir
    getMySchool: protectedProcedure.query(async ({ ctx }) => {
      if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
      if (!ctx.user.schoolId) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bir okula atanmamışsınız' });
      const school = await db.getSchoolById(ctx.user.schoolId);
      if (!school) throw new TRPCError({ code: 'NOT_FOUND' });
      const stats = await db.getSchoolStats(ctx.user.schoolId);
      const mentors = await db.getSchoolMentors(ctx.user.schoolId);
      return { ...school, stats, mentors };
    }),

    // Kendi okulundaki öğrencileri getir
    getMyStudents: protectedProcedure
      .input(z.object({ status: z.string().optional(), search: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
        if (!ctx.user.schoolId) return [];
        const schoolStudents = await db.getUsersBySchool(ctx.user.schoolId, { role: 'student', ...input });
        return schoolStudents.map(({ password: _, ...safe }) => safe);
      }),

    // Kendi okulundaki mentorları getir
    getMyMentors: protectedProcedure.query(async ({ ctx }) => {
      if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
      if (!ctx.user.schoolId) return [];
      return db.getSchoolMentors(ctx.user.schoolId);
    }),

    // Kendi okulunun istatistiklerini getir
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      if (!isSchoolAdminLevel(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
      if (!ctx.user.schoolId) return { studentCount: 0, mentorCount: 0, activeStudents: 0, completedStages: 0 };
      return db.getSchoolStats(ctx.user.schoolId);
    }),
   }),

  // İletişim formu
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2, 'Adınız en az 2 karakter olmalıdır'),
        email: z.string().email('Geçerli bir e-posta adresi giriniz'),
        subject: z.string().min(3, 'Konu en az 3 karakter olmalıdır'),
        message: z.string().min(10, 'Mesajınız en az 10 karakter olmalıdır').max(2000, 'Mesajınız en fazla 2000 karakter olabilir'),
        category: z.enum(['genel', 'teknik', 'odeme', 'oneri', 'sikayet']),
      }))
      .mutation(async ({ input }) => {
        const categoryLabels: Record<string, string> = {
          genel: 'Genel Bilgi',
          teknik: 'Teknik Destek',
          odeme: 'Ödeme/Fatura',
          oneri: 'Öneri/Geri Bildirim',
          sikayet: 'Şikayet',
        };
        try {
          await notifyOwner({
            title: `📩 İletişim Formu: ${categoryLabels[input.category] || input.category}`,
            content: `**Gönderen:** ${input.name} (${input.email})\n**Kategori:** ${categoryLabels[input.category]}\n**Konu:** ${input.subject}\n\n**Mesaj:**\n${input.message}`,
          });
        } catch (e) {
          console.warn('[Contact] Notification failed:', e);
        }
        return { success: true, message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.' };
      }),
  }),
});
export type AppRouter = typeof appRouter;
