CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`certificateNumber` varchar(50) NOT NULL,
	`pdfUrl` text,
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE INDEX `student_id_idx` ON `certificates` (`studentId`);--> statement-breakpoint
CREATE INDEX `certificate_number_idx` ON `certificates` (`certificateNumber`);