CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50) NOT NULL,
	`color` varchar(50) NOT NULL,
	`category` enum('milestone','speed','mastery','social','special') NOT NULL,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`xpReward` int NOT NULL DEFAULT 10,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `badges_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`notified` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `badge_slug_idx` ON `badges` (`slug`);--> statement-breakpoint
CREATE INDEX `badge_category_idx` ON `badges` (`category`);--> statement-breakpoint
CREATE INDEX `ub_user_id_idx` ON `user_badges` (`userId`);--> statement-breakpoint
CREATE INDEX `ub_badge_id_idx` ON `user_badges` (`badgeId`);--> statement-breakpoint
CREATE INDEX `ub_user_badge_idx` ON `user_badges` (`userId`,`badgeId`);