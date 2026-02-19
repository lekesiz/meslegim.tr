ALTER TABLE `reports` MODIFY COLUMN `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `reports` ADD `content` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `mentorFeedback` text;