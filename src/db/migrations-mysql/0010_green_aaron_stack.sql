CREATE TABLE `destination_best_seasons` (
	`id` varchar(36) NOT NULL,
	`destination_id` varchar(36) NOT NULL,
	`from_month` int NOT NULL,
	`to_month` int NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `destination_best_seasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `destinations` ADD `subtitle` text;--> statement-breakpoint
ALTER TABLE `destinations` ADD `hero_image_storage_key` text;--> statement-breakpoint
ALTER TABLE `destinations` ADD `destination_type_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `destinations` ADD `difficulty_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `destinations` ADD `duration_min_days` int;--> statement-breakpoint
ALTER TABLE `destinations` ADD `duration_max_days` int;--> statement-breakpoint
ALTER TABLE `destination_best_seasons` ADD CONSTRAINT `destination_best_seasons_destination_id_destinations_id_fk` FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `destinations` ADD CONSTRAINT `destinations_type_option_fk` FOREIGN KEY (`destination_type_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `destinations` ADD CONSTRAINT `destinations_difficulty_option_fk` FOREIGN KEY (`difficulty_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;