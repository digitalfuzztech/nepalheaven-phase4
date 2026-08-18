CREATE TABLE `cms_other_settings_options` (
	`id` varchar(36) NOT NULL,
	`group_key` varchar(50) NOT NULL,
	`name` varchar(191) NOT NULL,
	`value` varchar(191) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `cms_other_settings_options_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_other_settings_group_value_unique` UNIQUE(`group_key`,`value`)
);
--> statement-breakpoint
CREATE INDEX `cms_other_settings_group_sort_idx` ON `cms_other_settings_options` (`group_key`,`sort_order`);