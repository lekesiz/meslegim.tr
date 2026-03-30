CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_code_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotionCodeId` int NOT NULL,
	`userId` int NOT NULL,
	`purchaseId` int,
	`discountApplied` int NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotion_code_usages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed_amount') NOT NULL,
	`discountValue` int NOT NULL,
	`currency` varchar(10) DEFAULT 'try',
	`minPurchaseAmount` int DEFAULT 0,
	`maxUses` int,
	`currentUses` int NOT NULL DEFAULT 0,
	`maxUsesPerUser` int DEFAULT 1,
	`applicableProducts` text,
	`applicableSchools` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`startsAt` timestamp,
	`expiresAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotion_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotion_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `school_mentors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`mentorId` int NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`assignedBy` int,
	CONSTRAINT `school_mentors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50),
	`address` text,
	`city` varchar(100),
	`district` varchar(100),
	`phone` varchar(20),
	`email` varchar(320),
	`website` varchar(500),
	`logo` text,
	`type` enum('public','private','university','vocational','other') NOT NULL DEFAULT 'public',
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`maxStudents` int DEFAULT 500,
	`maxMentors` int DEFAULT 50,
	`subscriptionPlan` varchar(50),
	`subscriptionExpiresAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `schoolId` int;--> statement-breakpoint
CREATE INDEX `al_user_id_idx` ON `activity_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `al_action_idx` ON `activity_logs` (`action`);--> statement-breakpoint
CREATE INDEX `al_entity_idx` ON `activity_logs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `al_created_at_idx` ON `activity_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `pcu_promo_id_idx` ON `promotion_code_usages` (`promotionCodeId`);--> statement-breakpoint
CREATE INDEX `pcu_user_id_idx` ON `promotion_code_usages` (`userId`);--> statement-breakpoint
CREATE INDEX `promo_code_idx` ON `promotion_codes` (`code`);--> statement-breakpoint
CREATE INDEX `promo_active_idx` ON `promotion_codes` (`isActive`);--> statement-breakpoint
CREATE INDEX `sm_school_id_idx` ON `school_mentors` (`schoolId`);--> statement-breakpoint
CREATE INDEX `sm_mentor_id_idx` ON `school_mentors` (`mentorId`);--> statement-breakpoint
CREATE INDEX `sm_unique_pair_idx` ON `school_mentors` (`schoolId`,`mentorId`);--> statement-breakpoint
CREATE INDEX `school_code_idx` ON `schools` (`code`);--> statement-breakpoint
CREATE INDEX `school_city_idx` ON `schools` (`city`);--> statement-breakpoint
CREATE INDEX `school_status_idx` ON `schools` (`status`);