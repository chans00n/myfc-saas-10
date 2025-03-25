-- Check all push subscriptions
SELECT * FROM push_subscriptions;

-- Check subscriptions specifically for user with email chanson@barbellsforboobs.org
SELECT ps.* 
FROM push_subscriptions ps
JOIN users_table u ON ps.user_id = u.id
WHERE u.email = 'chanson@barbellsforboobs.org'; 