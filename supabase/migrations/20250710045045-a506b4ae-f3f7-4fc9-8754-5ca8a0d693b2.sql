
-- Check current RLS policies on leads table
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'leads';

-- Check current RLS policies on lead_visibility table  
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'lead_visibility';

-- Check all leads and their status (for debugging)
SELECT id, status, assigned_operator_id, traveler_name, created_at
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Check lead_visibility entries for the current user
SELECT lv.id, lv.lead_id, lv.operator_id, l.status, l.traveler_name
FROM lead_visibility lv
LEFT JOIN leads l ON l.id = lv.lead_id
WHERE lv.operator_id = '95ffe4a2-38e2-4940-8438-0398ba9eeca7'
ORDER BY lv.created_at DESC;

-- Check if there are leads that should be visible but aren't showing up
SELECT l.id, l.status, l.traveler_name, l.assigned_operator_id, l.created_at,
       CASE WHEN lv.lead_id IS NOT NULL THEN 'Has Visibility' ELSE 'No Visibility' END as visibility_status
FROM leads l
LEFT JOIN lead_visibility lv ON l.id = lv.lead_id AND lv.operator_id = '95ffe4a2-38e2-4940-8438-0398ba9eeca7'
WHERE l.status = 'unclaimed' OR lv.lead_id IS NOT NULL
ORDER BY l.created_at DESC
LIMIT 10;
