ALTER TABLE `cms_general_settings` ADD `office_latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `cms_general_settings` ADD `office_longitude` decimal(10,7);--> statement-breakpoint
INSERT INTO `cms_other_settings_options` (`id`, `group_key`, `name`, `value`, `sort_order`)
SELECT UUID(), 'general_settings_type', seed.`name`, seed.`value`, seed.`sort_order`
FROM (
	SELECT 'Legal Documents' AS `name`, 'legal-documents' AS `value`, 8 AS `sort_order`
	UNION ALL SELECT 'Company Images', 'company-images', 9
) seed
WHERE NOT EXISTS (
	SELECT 1 FROM `cms_other_settings_options` options
	WHERE options.`group_key` = 'general_settings_type' AND options.`value` = seed.`value`
);
