import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { generateStageReportAsync } from "../reportHelper";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  // Test endpoint - manuel rapor oluşturma
  generateReportTest: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        stageId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await generateStageReportAsync(input.userId, input.stageId);
        return { success: true, message: 'Report generated successfully' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }),

  logError: publicProcedure
    .input(
      z.object({
        level: z.enum(["info", "warn", "error", "fatal"]).optional(),
        source: z.enum(["client", "server"]),
        message: z.string(),
        stackTrace: z.string().optional(),
        path: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { logError } = await import("../db");
      await logError({
        ...input,
        userId: ctx.user?.id,
      });
      return { success: true };
    }),

  getLogs: publicProcedure.query(async () => {
    const { getDb } = await import("../db");
    const db = await getDb();
    if (!db) return [];
    const { errorLogs } = await import("../../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    return db.select().from(errorLogs).orderBy(desc(errorLogs.createdAt)).limit(20);
  }),
});
