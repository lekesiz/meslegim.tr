CREATE INDEX `user_id_idx` ON `reports` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_stages` (`userId`);--> statement-breakpoint
CREATE INDEX `stage_id_idx` ON `user_stages` (`stageId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `user_stages` (`status`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `users` (`status`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `mentor_id_idx` ON `users` (`mentorId`);