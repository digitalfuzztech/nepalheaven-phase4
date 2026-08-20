CREATE TABLE `experience_exclusions` (
	`id` varchar(36) NOT NULL,
	`experience_id` varchar(36) NOT NULL,
	`item` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `experience_exclusions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_faqs` (
	`id` varchar(36) NOT NULL,
	`experience_id` varchar(36) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `experience_faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_inclusions` (
	`id` varchar(36) NOT NULL,
	`experience_id` varchar(36) NOT NULL,
	`item` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `experience_inclusions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_itineraries` (
	`id` varchar(36) NOT NULL,
	`experience_id` varchar(36) NOT NULL,
	`min_day` int NOT NULL,
	`max_day` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `experience_itineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_content_blocks` (
	`id` varchar(36) NOT NULL,
	`blog_post_id` varchar(36) NOT NULL,
	`type` enum('text','highlight','image') NOT NULL,
	`content` text,
	`image_url` text,
	`image_storage_key` text,
	`alt_text` text,
	`caption` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `blog_content_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_highlights` (
	`id` varchar(36) NOT NULL,
	`blog_post_id` varchar(36) NOT NULL,
	`item` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `blog_highlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `experience_categories` ADD `hero_image_storage_key` text;--> statement-breakpoint
ALTER TABLE `experience_categories` ADD `experience_type_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `experience_categories` ADD `experience_type` text;--> statement-breakpoint
ALTER TABLE `experience_categories` ADD `card_link_text` text;--> statement-breakpoint
ALTER TABLE `experience_categories` ADD `overview` text;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `blog_type_option_id` varchar(36);--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `cover_image_storage_key` text;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `about_author` text;--> statement-breakpoint
ALTER TABLE `experience_exclusions` ADD CONSTRAINT `experience_exclusions_experience_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_faqs` ADD CONSTRAINT `experience_faqs_experience_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_inclusions` ADD CONSTRAINT `experience_inclusions_experience_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_itineraries` ADD CONSTRAINT `experience_itineraries_experience_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_content_blocks` ADD CONSTRAINT `blog_content_blocks_post_fk` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_highlights` ADD CONSTRAINT `blog_highlights_post_fk` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_categories` ADD CONSTRAINT `experience_categories_type_option_fk` FOREIGN KEY (`experience_type_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_type_option_fk` FOREIGN KEY (`blog_type_option_id`) REFERENCES `cms_other_settings_options`(`id`) ON DELETE set null ON UPDATE no action;
