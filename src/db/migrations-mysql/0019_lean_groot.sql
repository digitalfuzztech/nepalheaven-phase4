CREATE TABLE `financial_documents` (
	`id` varchar(36) NOT NULL,
	`type` enum('booking_invoice','refund_invoice') NOT NULL,
	`document_number` varchar(120) NOT NULL,
	`booking_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`payment_id` varchar(36),
	`storage_key` varchar(191) NOT NULL,
	`filename` text NOT NULL,
	`mime_type` varchar(120) NOT NULL,
	`file_size` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL,
	`snapshot` text,
	`issued_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `financial_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `financial_documents_storage_key_unique` UNIQUE(`storage_key`),
	CONSTRAINT `financial_documents_number_unique` UNIQUE(`document_number`)
);
--> statement-breakpoint
CREATE TABLE `vat_rule_countries` (
	`id` varchar(36) NOT NULL,
	`rule_id` varchar(36) NOT NULL,
	`country_code` varchar(2) NOT NULL,
	CONSTRAINT `vat_rule_countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `vat_rule_countries_country_unique` UNIQUE(`country_code`)
);
--> statement-breakpoint
CREATE TABLE `vat_rules` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `vat_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `payments` ADD `review_status` enum('unreviewed','reviewed','needs_attention') DEFAULT 'unreviewed' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `review_note` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `reviewed_at` datetime(3);--> statement-breakpoint
ALTER TABLE `payments` ADD `reviewed_by` varchar(36);--> statement-breakpoint
ALTER TABLE `financial_documents` ADD CONSTRAINT `financial_documents_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_documents` ADD CONSTRAINT `financial_documents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_documents` ADD CONSTRAINT `financial_documents_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vat_rule_countries` ADD CONSTRAINT `vat_rule_countries_rule_id_vat_rules_id_fk` FOREIGN KEY (`rule_id`) REFERENCES `vat_rules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `financial_documents_user_type_issued_idx` ON `financial_documents` (`user_id`,`type`,`issued_at`);--> statement-breakpoint
CREATE INDEX `financial_documents_booking_type_idx` ON `financial_documents` (`booking_id`,`type`);--> statement-breakpoint
CREATE INDEX `vat_rule_countries_rule_idx` ON `vat_rule_countries` (`rule_id`);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payments_review_created_idx` ON `payments` (`review_status`,`created_at`);