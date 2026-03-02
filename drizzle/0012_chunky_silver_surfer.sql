CREATE TABLE `stage_unlock_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unlockedByUserId` int NOT NULL,
	`unlockedByRole` varchar(50) NOT NULL,
	`studentId` int NOT NULL,
	`stageId` int NOT NULL,
	`stageName` varchar(255) NOT NULL,
	`studentName` varchar(255),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stage_unlock_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `unlock_by_idx` ON `stage_unlock_logs` (`unlockedByUserId`);--> statement-breakpoint
CREATE INDEX `unlock_student_idx` ON `stage_unlock_logs` (`studentId`);--> statement-breakpoint
CREATE INDEX `unlock_stage_idx` ON `stage_unlock_logs` (`stageId`);--> statement-breakpoint
CREATE INDEX `unlock_created_at_idx` ON `stage_unlock_logs` (`createdAt`);