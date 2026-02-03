/*
  # Add enabled field to menu items

  1. Changes
    - Update main_navigation setting to add 'enabled: true' to all menu items
    - This allows admins to show/hide menu items without deleting them
  
  2. Purpose
    - Enable dynamic menu management from admin interface
    - Maintain menu configuration even when items are temporarily hidden
*/

-- Update main_navigation to add enabled field to all items
UPDATE site_settings
SET setting_value = jsonb_set(
  setting_value,
  '{items}',
  (
    SELECT jsonb_agg(
      item || jsonb_build_object('enabled', true)
    )
    FROM jsonb_array_elements(setting_value->'items') AS item
  )
)
WHERE setting_key = 'main_navigation';
