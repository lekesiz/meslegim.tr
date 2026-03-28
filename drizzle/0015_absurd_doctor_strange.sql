CREATE TABLE `pilot_feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`npsScore` int NOT NULL,
	`whatWorkedWell` text,
	`whatNeedsImprovement` text,
	`wouldRecommend` boolean,
	`additionalComments` text,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pilot_feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `pf_user_id_idx` ON `pilot_feedbacks` (`userId`);--> statement-breakpoint
CREATE INDEX `pf_nps_score_idx` ON `pilot_feedbacks` (`npsScore`);--> statement-breakpoint
CREATE INDEX `pf_created_at_idx` ON `pilot_feedbacks` (`createdAt`);