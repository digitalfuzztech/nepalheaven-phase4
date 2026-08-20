INSERT INTO `cms_other_settings_options` (`id`, `group_key`, `name`, `value`, `sort_order`)
SELECT UUID(), 'general_settings_type', 'Team', 'team', 6 FROM DUAL
WHERE NOT EXISTS (
	SELECT 1 FROM `cms_other_settings_options`
	WHERE `group_key` = 'general_settings_type' AND `value` = 'team'
);
--> statement-breakpoint
INSERT INTO `cms_other_settings_options` (`id`, `group_key`, `name`, `value`, `sort_order`)
SELECT UUID(), 'blog_type', categories.`name`, categories.`slug`, 0
FROM `blog_categories` categories
WHERE NOT EXISTS (
	SELECT 1 FROM `cms_other_settings_options` options
	WHERE options.`group_key` = 'blog_type' AND options.`value` = categories.`slug`
);
--> statement-breakpoint
INSERT INTO `cms_other_settings_options` (`id`, `group_key`, `name`, `value`, `sort_order`)
SELECT UUID(), 'blog_type', seed.`name`, seed.`value`, seed.`sort_order`
FROM (
	SELECT 'Travel Guide' AS `name`, 'travel-guide' AS `value`, 0 AS `sort_order`
	UNION ALL SELECT 'Trekking', 'trekking', 1
	UNION ALL SELECT 'Culture', 'culture', 2
	UNION ALL SELECT 'Luxury Travel', 'luxury-travel', 3
	UNION ALL SELECT 'Wildlife', 'wildlife', 4
	UNION ALL SELECT 'Practical Advice', 'practical-advice', 5
) seed
WHERE NOT EXISTS (
	SELECT 1 FROM `cms_other_settings_options` options
	WHERE options.`group_key` = 'blog_type' AND options.`value` = seed.`value`
);
--> statement-breakpoint
UPDATE `blog_posts` posts
JOIN `blog_categories` categories ON categories.`id` = posts.`category_id`
JOIN `cms_other_settings_options` options ON options.`group_key` = 'blog_type' AND options.`value` = categories.`slug`
SET posts.`blog_type_option_id` = options.`id`
WHERE posts.`blog_type_option_id` IS NULL;
--> statement-breakpoint
UPDATE `experience_categories` experiences
JOIN `cms_other_settings_options` options ON options.`group_key` = 'experience_type'
	AND (options.`value` = experiences.`slug` OR LOWER(options.`name`) = LOWER(experiences.`name`))
SET experiences.`experience_type_option_id` = options.`id`, experiences.`experience_type` = options.`name`
WHERE experiences.`experience_type_option_id` IS NULL;
