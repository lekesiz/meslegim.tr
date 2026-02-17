CREATE TABLE `answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`answer` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stageId` int NOT NULL,
	`text` text NOT NULL,
	`type` enum('multiple_choice','likert','ranking','text') NOT NULL,
	`options` json,
	`required` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageId` int,
	`type` enum('stage','final') NOT NULL,
	`fileUrl` varchar(500),
	`fileKey` varchar(500),
	`status` enum('pending_approval','approved') NOT NULL DEFAULT 'pending_approval',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ageGroup` enum('14-17','18-21','22-24') NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageId` int NOT NULL,
	`status` enum('locked','active','completed') NOT NULL DEFAULT 'locked',
	`unlockedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_stages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('student','mentor','admin') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `tcKimlik` varchar(11);--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('pending','active','inactive') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ageGroup` enum('14-17','18-21','22-24');--> statement-breakpoint
ALTER TABLE `users` ADD `mentorId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `kvkkConsent` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `kvkkConsentDate` timestamp;