-- 004_make_admin_TEMPLATE.sql : run ONCE, by you, in the Supabase SQL Editor,
-- AFTER you have created your admin user in Authentication > Users.
-- Replace the email below with your admin account's email, exactly as created.
-- Do NOT put this in any file that the website loads.

insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'olarewajuagbaje@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- Check the result (should show one row):
select u.email, r.role from public.user_roles r join auth.users u on u.id = r.user_id;