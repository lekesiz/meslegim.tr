CREATE INDEX `user_id_idx` ON `answers` (`userId`);--> statement-breakpoint
CREATE INDEX `question_id_idx` ON `answers` (`questionId`);--> statement-breakpoint
CREATE INDEX `user_question_idx` ON `answers` (`userId`,`questionId`);--> statement-breakpoint
CREATE INDEX `ka_acknowledged_by_idx` ON `kpi_anomalies` (`acknowledgedBy`);--> statement-breakpoint
CREATE INDEX `pcu_purchase_id_idx` ON `promotion_code_usages` (`purchaseId`);--> statement-breakpoint
CREATE INDEX `promo_created_by_idx` ON `promotion_codes` (`createdBy`);--> statement-breakpoint
CREATE INDEX `stage_id_idx` ON `questions` (`stageId`);--> statement-breakpoint
CREATE INDEX `stage_id_idx` ON `reports` (`stageId`);--> statement-breakpoint
CREATE INDEX `approved_by_idx` ON `reports` (`approvedBy`);--> statement-breakpoint
CREATE INDEX `sm_assigned_by_idx` ON `school_mentors` (`assignedBy`);--> statement-breakpoint
CREATE INDEX `school_id_idx` ON `users` (`schoolId`);