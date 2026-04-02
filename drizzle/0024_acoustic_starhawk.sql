CREATE TABLE `admin_widget_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`widgetLayout` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_widget_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `awp_user_id_idx` ON `admin_widget_preferences` (`userId`);