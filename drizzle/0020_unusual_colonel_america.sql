CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` varchar(50) NOT NULL,
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`amountInCents` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'try',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `purchasedPackage` varchar(50);--> statement-breakpoint
CREATE INDEX `p_user_id_idx` ON `purchases` (`userId`);--> statement-breakpoint
CREATE INDEX `p_stripe_session_idx` ON `purchases` (`stripeSessionId`);--> statement-breakpoint
CREATE INDEX `p_status_idx` ON `purchases` (`status`);