CREATE TABLE `bulk_email_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`subject` varchar(500) NOT NULL,
	`htmlContent` text NOT NULL,
	`segment` varchar(100) NOT NULL,
	`recipientCount` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`failedCount` int NOT NULL DEFAULT 0,
	`campaignStatus` enum('draft','sending','completed','failed') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bulk_email_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inactivity_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailSentAt` timestamp NOT NULL DEFAULT (now()),
	`inactiveDays` int NOT NULL,
	`emailType` varchar(50) NOT NULL DEFAULT 'reminder',
	`success` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inactivity_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bec_admin_id_idx` ON `bulk_email_campaigns` (`adminId`);--> statement-breakpoint
CREATE INDEX `bec_status_idx` ON `bulk_email_campaigns` (`campaignStatus`);--> statement-breakpoint
CREATE INDEX `bec_segment_idx` ON `bulk_email_campaigns` (`segment`);--> statement-breakpoint
CREATE INDEX `in_user_id_idx` ON `inactivity_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `in_email_sent_idx` ON `inactivity_notifications` (`emailSentAt`);