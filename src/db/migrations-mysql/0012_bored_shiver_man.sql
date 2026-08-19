CREATE TABLE `destination_faqs` (
	`id` varchar(36) NOT NULL,
	`destination_id` varchar(36) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `destination_faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `destination_faqs` ADD CONSTRAINT `destination_faqs_destination_id_destinations_id_fk` FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE cascade ON UPDATE no action;