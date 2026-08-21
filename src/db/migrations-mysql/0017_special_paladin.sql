ALTER TABLE `testimonials` ADD `avatar_storage_key` text;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `country_code` varchar(2);--> statement-breakpoint
ALTER TABLE `testimonials` ADD `association_type` enum('destination','package','experience');--> statement-breakpoint
ALTER TABLE `testimonials` ADD `destination_id` varchar(36);--> statement-breakpoint
ALTER TABLE `testimonials` ADD `package_id` varchar(36);--> statement-breakpoint
ALTER TABLE `testimonials` ADD `experience_id` varchar(36);--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_destination_id_destinations_id_fk` FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_package_id_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_experience_id_experience_categories_id_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience_categories`(`id`) ON DELETE set null ON UPDATE no action;