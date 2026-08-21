ALTER TABLE `users` ADD `blocked_at` datetime(3);--> statement-breakpoint
ALTER TABLE `leads` ADD `hidden_at` datetime(3);--> statement-breakpoint
ALTER TABLE `lead_interactions` ADD `hidden_at` datetime(3);--> statement-breakpoint
CREATE INDEX `leads_type_hidden_created_idx` ON `leads` (`type`,`hidden_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `lead_interactions_crm_visibility_idx` ON `lead_interactions` (`interaction_type`,`channel`,`direction`,`hidden_at`,`created_at`);