CREATE TABLE `cms_featured_content` (
	`id` varchar(36) NOT NULL,
	`group_key` varchar(150) NOT NULL,
	`entity_type` enum('destination','package','experience','blog_post','testimonial','media') NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`slot` varchar(100),
	`sort_order` int NOT NULL DEFAULT 0,
	`enabled` boolean NOT NULL DEFAULT true,
	`updated_by_user_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_featured_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_featured_content_group_entity_unique` UNIQUE(`group_key`,`entity_type`,`entity_id`)
);
--> statement-breakpoint
CREATE TABLE `cms_footer_settings` (
	`id` varchar(36) NOT NULL,
	`key` varchar(50) NOT NULL DEFAULT 'footer',
	`company_description` text,
	`journal_description` text,
	`logo_media_id` varchar(36),
	`updated_by_user_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_footer_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_footer_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `cms_general_settings` (
	`id` varchar(36) NOT NULL,
	`key` varchar(50) NOT NULL DEFAULT 'general',
	`website_name` text NOT NULL,
	`company_name` text NOT NULL,
	`tagline` text,
	`main_logo_media_id` varchar(36),
	`light_logo_media_id` varchar(36),
	`favicon_media_id` varchar(36),
	`address` text,
	`country` text,
	`phone` text,
	`whatsapp` text,
	`email` text,
	`office_hours` text,
	`facebook_url` text,
	`instagram_url` text,
	`youtube_url` text,
	`tiktok_url` text,
	`linkedin_url` text,
	`x_url` text,
	`copyright_text` text,
	`default_seo_title` text,
	`default_seo_description` text,
	`default_og_image_media_id` varchar(36),
	`updated_by_user_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_general_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_general_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `cms_navigation_items` (
	`id` varchar(36) NOT NULL,
	`menu_id` varchar(36) NOT NULL,
	`label` varchar(180) NOT NULL,
	`link_type` enum('internal','external') NOT NULL DEFAULT 'internal',
	`path` varchar(500),
	`url` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`enabled` boolean NOT NULL DEFAULT true,
	`open_new_tab` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_navigation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cms_navigation_menus` (
	`id` varchar(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_navigation_menus_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_navigation_menus_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `cms_page_sections` (
	`id` varchar(36) NOT NULL,
	`page_id` varchar(36) NOT NULL,
	`section_key` varchar(100) NOT NULL,
	`schema_version` int NOT NULL DEFAULT 1,
	`content` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`updated_by_user_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_page_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_page_sections_page_section_unique` UNIQUE(`page_id`,`section_key`)
);
--> statement-breakpoint
CREATE TABLE `cms_pages` (
	`id` varchar(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`name` varchar(180) NOT NULL,
	`route_path` varchar(191),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`seo_title` text,
	`seo_description` text,
	`og_image_media_id` varchar(36),
	`no_index` boolean NOT NULL DEFAULT false,
	`updated_by_user_id` varchar(36),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_pages_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `media` ADD `original_filename` varchar(255);--> statement-breakpoint
ALTER TABLE `media` ADD `storage_provider` varchar(100);--> statement-breakpoint
ALTER TABLE `media` ADD `storage_key` text;--> statement-breakpoint
ALTER TABLE `media` ADD `mime_type` varchar(191);--> statement-breakpoint
ALTER TABLE `media` ADD `file_size_bytes` bigint;--> statement-breakpoint
ALTER TABLE `media` ADD `width` int;--> statement-breakpoint
ALTER TABLE `media` ADD `height` int;--> statement-breakpoint
ALTER TABLE `media` ADD `duration_seconds` int;--> statement-breakpoint
ALTER TABLE `media` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `media` ADD `lifecycle_status` enum('uploading','processing','ready','failed','archived') DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `processing_error` text;--> statement-breakpoint
ALTER TABLE `media` ADD `sort_order` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `created_by_user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `cms_featured_content` ADD CONSTRAINT `cms_featured_content_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_footer_settings` ADD CONSTRAINT `cms_footer_settings_logo_media_id_media_id_fk` FOREIGN KEY (`logo_media_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_footer_settings` ADD CONSTRAINT `cms_footer_settings_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_general_settings` ADD CONSTRAINT `cms_general_settings_main_logo_media_id_media_id_fk` FOREIGN KEY (`main_logo_media_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_general_settings` ADD CONSTRAINT `cms_general_settings_light_logo_media_id_media_id_fk` FOREIGN KEY (`light_logo_media_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_general_settings` ADD CONSTRAINT `cms_general_settings_favicon_media_id_media_id_fk` FOREIGN KEY (`favicon_media_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_general_settings` ADD CONSTRAINT `cms_general_settings_default_og_image_media_id_media_id_fk` FOREIGN KEY (`default_og_image_media_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_general_settings` ADD CONSTRAINT `cms_general_settings_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_navigation_items` ADD CONSTRAINT `cms_navigation_items_menu_id_cms_navigation_menus_id_fk` FOREIGN KEY (`menu_id`) REFERENCES `cms_navigation_menus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_page_sections` ADD CONSTRAINT `cms_page_sections_page_id_cms_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `cms_pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_page_sections` ADD CONSTRAINT `cms_page_sections_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_pages` ADD CONSTRAINT `cms_pages_og_image_media_id_media_id_fk` FOREIGN KEY (`og_image_media_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_pages` ADD CONSTRAINT `cms_pages_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `cms_featured_content_group_sort_idx` ON `cms_featured_content` (`group_key`,`sort_order`);--> statement-breakpoint
CREATE INDEX `cms_navigation_items_menu_sort_idx` ON `cms_navigation_items` (`menu_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `cms_page_sections_page_sort_idx` ON `cms_page_sections` (`page_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `cms_pages_status_idx` ON `cms_pages` (`status`);--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;