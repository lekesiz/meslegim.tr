CREATE TABLE `email_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`trackingId` varchar(64) NOT NULL,
	`eventType` enum('open','click') NOT NULL,
	`linkUrl` text,
	`userAgent` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_tracking_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_tracking_events_trackingId_unique` UNIQUE(`trackingId`)
);
--> statement-breakpoint
CREATE INDEX `ete_campaign_id_idx` ON `email_tracking_events` (`campaignId`);--> statement-breakpoint
CREATE INDEX `ete_tracking_id_idx` ON `email_tracking_events` (`trackingId`);--> statement-breakpoint
CREATE INDEX `ete_event_type_idx` ON `email_tracking_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `ete_recipient_idx` ON `email_tracking_events` (`recipientEmail`);