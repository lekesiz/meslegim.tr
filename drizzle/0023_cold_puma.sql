CREATE TABLE `kpi_anomalies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`kpiName` varchar(100) NOT NULL,
	`kpiLabel` varchar(255) NOT NULL,
	`currentValue` int NOT NULL,
	`avgValue` int NOT NULL,
	`deviationPercent` int NOT NULL,
	`direction` enum('up','down') NOT NULL,
	`severity` enum('warning','critical') NOT NULL DEFAULT 'warning',
	`alertSent` boolean NOT NULL DEFAULT false,
	`acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kpi_anomalies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ka_date_idx` ON `kpi_anomalies` (`date`);--> statement-breakpoint
CREATE INDEX `ka_kpi_name_idx` ON `kpi_anomalies` (`kpiName`);--> statement-breakpoint
CREATE INDEX `ka_severity_idx` ON `kpi_anomalies` (`severity`);--> statement-breakpoint
CREATE INDEX `ka_acknowledged_idx` ON `kpi_anomalies` (`acknowledged`);