-- Update push_notifications_enabled flag for chanson@barbellsforboobs.org
UPDATE users_table 
SET push_notifications_enabled = true 
WHERE email = 'chanson@barbellsforboobs.org'; 