CREATE TABLE `email_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageActivation` boolean NOT NULL DEFAULT true,
	`reportReady` boolean NOT NULL DEFAULT true,
	`badgeEarned` boolean NOT NULL DEFAULT true,
	`certificateReady` boolean NOT NULL DEFAULT true,
	`stageReminder` boolean NOT NULL DEFAULT true,
	`weeklyDigest` boolean NOT NULL DEFAULT false,
	`marketingEmails` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('stage_incomplete','stage_upcoming','weekly_digest') NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`sent` boolean NOT NULL DEFAULT false,
	`relatedId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ep_user_id_idx` ON `email_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `ps_user_id_idx` ON `push_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `sr_user_id_idx` ON `scheduled_reminders` (`userId`);--> statement-breakpoint
CREATE INDEX `sr_scheduled_for_idx` ON `scheduled_reminders` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `sr_sent_idx` ON `scheduled_reminders` (`sent`);