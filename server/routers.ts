import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { generateStageReportAsync } from './reportHelper';

// Role-based procedures
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'student') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Cette action est réservée aux étudiants' });
  }
  if (ctx.user.status !== 'active') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Votre compte doit être activé par un mentor' });
  }
  return next({ ctx });
});

const mentorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'mentor' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Cette action est réservée aux mentors' });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
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
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        tcKimlik: z.string().length(11),
        ageGroup: z.enum(['14-17', '18-21', '22-24']),
      }))
      .mutation(async ({ input }) => {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Bu e-posta adresi zaten kayıtlı' });
        }
        
        // Create new student with pending status
        const newUser = await db.createUser({
          name: input.name,
          email: input.email,
          phone: input.phone,
          tcKimlik: input.tcKimlik,
          ageGroup: input.ageGroup,
          role: 'student',
          status: 'pending',
        });
        
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
      const mentorId = ctx.user.role === 'mentor' ? ctx.user.id : undefined;
      return await db.getPendingStudents(mentorId);
    }),
    
    activateStudent: mentorProcedure
      .input(z.object({ studentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verify the student is assigned to this mentor (unless admin)
        if (ctx.user.role === 'mentor') {
          const student = await db.getUserById(input.studentId);
          if (!student || student.mentorId !== ctx.user.id) {
            throw new TRPCError({ 
              code: 'FORBIDDEN', 
              message: 'Vous ne pouvez activer que vos propres étudiants' 
            });
          }
        }
        
        await db.updateUser(input.studentId, { status: 'active' });
        
        // TODO: Initialize first stage for the student
        // TODO: Send activation email
        
        return { success: true };
      }),
    
    getMyStudents: mentorProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin') {
        // Admins see all students
        return (await db.getAllUsers()).filter(u => u.role === 'student');
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
        if (ctx.user.role === 'mentor' && student.mentorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const stages = await db.getUserStages(student.id);
        const reports = await db.getReportsByUser(student.id);
        
        return { student, stages, reports };
      }),
    
    getPendingReports: mentorProcedure.query(async ({ ctx }) => {
      const mentorId = ctx.user.role === 'mentor' ? ctx.user.id : undefined;
      return await db.getPendingReports(mentorId);
    }),
    
    approveReport: mentorProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Verify the report belongs to one of mentor's students
        await db.approveReport(input.reportId, ctx.user.id);
        return { success: true };
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
        
        return { success: true, message: 'Etap başarıyla tamamlandı!' };
      }),
    
    getMyReports: studentProcedure.query(async ({ ctx }) => {
      return await db.getReportsByUser(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
