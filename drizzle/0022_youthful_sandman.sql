CREATE TABLE `csv_export_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exportType` varchar(50) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`recordCount` int,
	`dateFilterPreset` varchar(20),
	`dateFilterStart` timestamp,
	`dateFilterEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `csv_export_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cel_user_id_idx` ON `csv_export_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `cel_export_type_idx` ON `csv_export_logs` (`exportType`);--> statement-breakpoint
CREATE INDEX `cel_created_at_idx` ON `csv_export_logs` (`createdAt`);