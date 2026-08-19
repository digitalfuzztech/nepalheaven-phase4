ALTER TABLE `media` ADD `category_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `media` ADD `associated_destination_id` varchar(36);--> statement-breakpoint
ALTER TABLE `media` ADD `associated_package_id` varchar(36);--> statement-breakpoint
ALTER TABLE `media` ADD `associated_experience_id` varchar(36);--> statement-breakpoint
ALTER TABLE `media` ADD `general_settings_type_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_category_option_id_cms_other_settings_options_id_fk` FOREIGN KEY (`category_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_associated_destination_id_destinations_id_fk` FOREIGN KEY (`associated_destination_id`) REFERENCES `destinations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_associated_package_id_packages_id_fk` FOREIGN KEY (`associated_package_id`) REFERENCES `packages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_associated_experience_id_experience_categories_id_fk` FOREIGN KEY (`associated_experience_id`) REFERENCES `experience_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_general_type_option_fk` FOREIGN KEY (`general_settings_type_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_category_option_idx` ON `media` (`category_option_id`);--> statement-breakpoint
CREATE INDEX `media_destination_idx` ON `media` (`associated_destination_id`);--> statement-breakpoint
CREATE INDEX `media_package_idx` ON `media` (`associated_package_id`);--> statement-breakpoint
CREATE INDEX `media_experience_idx` ON `media` (`associated_experience_id`);--> statement-breakpoint
CREATE INDEX `media_general_settings_type_idx` ON `media` (`general_settings_type_option_id`);--> statement-breakpoint
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);