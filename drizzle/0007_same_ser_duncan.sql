CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `sender_id_idx` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `receiver_id_idx` ON `messages` (`receiverId`);--> statement-breakpoint
CREATE INDEX `is_read_idx` ON `messages` (`isRead`);