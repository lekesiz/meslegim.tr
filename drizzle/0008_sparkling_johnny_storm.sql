CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`mentorId` int NOT NULL,
	`reportId` int,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `student_id_idx` ON `feedbacks` (`studentId`);--> statement-breakpoint
CREATE INDEX `mentor_id_idx` ON `feedbacks` (`mentorId`);--> statement-breakpoint
CREATE INDEX `report_id_idx` ON `feedbacks` (`reportId`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `feedbacks` (`rating`);