CREATE TABLE `package_faqs` (
	`id` varchar(36) NOT NULL,
	`package_id` varchar(36) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `package_faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `package_reviews` (
	`id` varchar(36) NOT NULL,
	`package_id` varchar(36) NOT NULL,
	`rating` decimal(2,1) NOT NULL,
	`review_text` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_country_code` varchar(2) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `package_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `packages` MODIFY COLUMN `difficulty` text;--> statement-breakpoint
ALTER TABLE `package_itineraries` ADD `min_day` int;--> statement-breakpoint
ALTER TABLE `package_itineraries` ADD `max_day` int;--> statement-breakpoint
ALTER TABLE `package_tiers` ADD `tier_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `packages` ADD `package_type_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `packages` ADD `overview` text;--> statement-breakpoint
ALTER TABLE `packages` ADD `duration_min_days` int;--> statement-breakpoint
ALTER TABLE `packages` ADD `duration_max_days` int;--> statement-breakpoint
ALTER TABLE `packages` ADD `difficulty_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `packages` ADD `group_size_min` int;--> statement-breakpoint
ALTER TABLE `packages` ADD `group_size_max` int;--> statement-breakpoint
ALTER TABLE `packages` ADD `hero_image_storage_key` text;--> statement-breakpoint
ALTER TABLE `package_faqs` ADD CONSTRAINT `package_faqs_package_id_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `package_reviews` ADD CONSTRAINT `package_reviews_package_id_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `package_tiers` ADD CONSTRAINT `package_tiers_tier_option_id_cms_other_settings_options_id_fk` FOREIGN KEY (`tier_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packages` ADD CONSTRAINT `packages_type_option_fk` FOREIGN KEY (`package_type_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packages` ADD CONSTRAINT `packages_difficulty_option_fk` FOREIGN KEY (`difficulty_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;