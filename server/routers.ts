import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { generateStageReportAsync } from './reportHelper';
import { generatePDF } from './services/pdfGenerator';
import { sendEmail, getRegistrationEmailTemplate, getApprovalEmailTemplate, getReportApprovedEmailTemplate } from './_core/resend-email';
import bcrypt from 'bcryptjs';
import { sdk } from './_core/sdk';
import { hasRole, hasAnyRole } from './roleHelper';

// Role-based procedures
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRole(ctx.user.role, 'student')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Cette action est réservée aux étudiants' });
  }
  if (ctx.user.status !== 'active') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Votre compte doit être activé par un mentor' });
  }
  return next({ ctx });
});

const mentorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ['mentor', 'admin'])) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Cette action est réservée aux mentors' });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRole(ctx.user.role, 'admin')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Cette action est réservée aux administrateurs' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
        
        // Check if user is active
        if (user.status !== 'active') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Hesabınız henüz aktif değil. Mentor onayı bekleniyor.' });
        }
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId || '', { name: user.name || '' });
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return { success: true, user };
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
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
        const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        await sendEmail({
          to: user.email || '',
          subject: 'Meslegim.tr - Şifre Sıfırlama',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <img src="https://meslegim-tr.manus.space/logo.png" alt="Meslegim.tr Logo" style="height: 50px; margin-bottom: 20px;" />
                <h1 style="color: white; margin: 0;">Meslegim.tr</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Kariyer Değerlendirme Platformu</p>
              </div>
              <div style="padding: 40px 20px; background: white;">
                <h2 style="color: #333; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
                <p style="color: #666; line-height: 1.6;">Merhaba ${user.name},</p>
                <p style="color: #666; line-height: 1.6;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu link 1 saat geçerlidir.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Şifremi Sıfırla</a>
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
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        // Verify token and get user
        let userOpenId: string;
        try {
          const session = await sdk.verifySession(input.token);
          if (!session || !session.openId) {
            throw new Error('Invalid session');
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
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        tcKimlik: z.string().length(11),
        ageGroup: z.enum(['14-17', '18-21', '22-24']),
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
        
        // Create new student with pending status
        const newUser = await db.createUser({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          phone: input.phone,
          tcKimlik: input.tcKimlik,
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
          days: Math.floor((new Date(us.completedAt!).getTime() - new Date(us.unlockedAt!).getTime()) / (1000 * 60 * 60 * 24)),
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
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
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
      .mutation(async ({ input }) => {
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
                const loginUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/login`;
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
        // TODO: Implement getAllQuestions if needed
        return [];
      }),
  }),

  // Mentor procedures
  mentor: router({
    getPendingStudents: mentorProcedure.query(async ({ ctx }) => {
      // Mentors see only their assigned students, admins see all
      const mentorId = hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') ? ctx.user.id : undefined;
      return await db.getPendingStudents(mentorId);
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
              message: 'Vous ne pouvez activer que vos propres étudiants' 
            });
          }
        }
        
        await db.updateUser(input.studentId, { status: 'active' });
        
        // Get student details for email
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
        }
        
        // Send activation email
        if (student.email && student.name) {
          try {
            const loginUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/login`;
            await sendEmail({
              to: student.email,
              subject: '🎉 Başvurunuz Onaylan dı - Meslegim.tr',
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
      return await db.getStudentsByMentor(ctx.user.id);
    }),
    
    getStudentDetails: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Étudiant non trouvé' });
        }
        
        // Verify access
        if (hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') && student.mentorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const stages = await db.getUserStages(student.id);
        const reports = await db.getReportsByUser(student.id);
        const progress = await db.calculateStudentProgress(student.id);
        
        return { student, stages, reports, progress };
      }),
    
    getPendingReports: mentorProcedure.query(async ({ ctx }) => {
      const mentorId = hasRole(ctx.user.role, 'mentor') && !hasRole(ctx.user.role, 'admin') ? ctx.user.id : undefined;
      return await db.getPendingReports(mentorId);
    }),
    
    approveReport: mentorProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Get report details
        const report = await db.getReportById(input.reportId);
        if (!report) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
        }
        
        // Approve the report
        await db.approveReport(input.reportId, ctx.user.id);
        
        // Get student and stage details for email
        const student = report.userId ? await db.getUserById(report.userId) : null;
        const stage = report.stageId ? await db.getStageById(report.stageId) : null;
        
        // Send approval email
        if (student?.email && student?.name && stage?.name) {
          try {
            const reportUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/reports/${report.id}`;
            await sendEmail({
              to: student.email,
              subject: '✅ Raporunuz Onaylan dı - Meslegim.tr',
              html: getReportApprovedEmailTemplate(student.name, stage.name, reportUrl),
            });
          } catch (error) {
            console.error('Failed to send report approval email:', error);
            // Don't fail the approval if email fails
          }
        }
        
        return { success: true };
      }),
    
    // Mentor Performance Statistics
    getMyStats: mentorProcedure.query(async ({ ctx }) => {
      return await db.getMentorStats(ctx.user.id);
    }),
    
    // Mentor Notes endpoints
    getNotesByStudent: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify access
        const student = await db.getUserById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Étudiant non trouvé' });
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Étudiant non trouvé' });
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Note non trouvée' });
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Note non trouvée' });
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
                  <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/dashboard/mentor" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
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
  }),
});

export type AppRouter = typeof appRouter;
