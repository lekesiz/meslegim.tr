CREATE TABLE `mentor_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`studentId` int NOT NULL,
	`note` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `mentor_id_idx` ON `mentor_notes` (`mentorId`);--> statement-breakpoint
CREATE INDEX `student_id_idx` ON `mentor_notes` (`studentId`);