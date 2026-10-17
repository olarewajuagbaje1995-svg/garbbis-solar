-- 003_seed_categories_and_demo.sql : starter categories and clearly labelled DEMO data.
-- Safe to run more than once. Run this THIRD.
-- Delete the DEMO rows from the admin dashboard when you add real inventory.

insert into public.categories (slug, name, sort_order) values
  ('solar-panels', 'Solar Panels', 1),
  ('inverters', 'Inverters', 2),
  ('batteries', 'Batteries', 3),
  ('solar-accessories', 'Solar Accessories', 4)
on conflict (slug) do nothing;

insert into public.products (slug, name, description, category_id, price_ngn, availability, specifications, is_published)
select 'demo-solar-panel', 'DEMO - Solar Panel (sample listing)',
       'This is a demonstration product. Replace it with your real product.',
       c.id, 100000, 'in_stock',
       '[{"label":"Type","value":"Demo only"},{"label":"Power","value":"Demo only"}]'::jsonb, true
from public.categories c where c.slug = 'solar-panels'
on conflict (slug) do nothing;

insert into public.products (slug, name, description, category_id, price_ngn, availability, specifications, is_published)
select 'demo-inverter', 'DEMO - Inverter (sample listing)',
       'This is a demonstration product. Replace it with your real product.',
       c.id, null, 'contact',
       '[{"label":"Capacity","value":"Demo only"}]'::jsonb, true
from public.categories c where c.slug = 'inverters'
on conflict (slug) do nothing;

insert into public.products (slug, name, description, category_id, price_ngn, availability, specifications, is_published)
select 'demo-battery', 'DEMO - Battery (sample listing)',
       'This is a demonstration product. Replace it with your real product.',
       c.id, 250000, 'out_of_stock',
       '[{"label":"Type","value":"Demo only"}]'::jsonb, true
from public.categories c where c.slug = 'batteries'
on conflict (slug) do nothing;

insert into public.products (slug, name, description, category_id, price_ngn, availability, specifications, is_published)
select 'demo-accessory', 'DEMO - Solar Accessory (sample listing)',
       'This is a demonstration product. Replace it with your real product.',
       c.id, 15000, 'in_stock', '[]'::jsonb, true
from public.categories c where c.slug = 'solar-accessories'
on conflict (slug) do nothing;

insert into public.services (slug, title, summary, description, sort_order, is_published) values
  ('solar-installation', 'Solar Installation', 'Installation of solar panel systems.', 'Edit this description in the admin dashboard to describe how you install solar systems.', 1, true),
  ('inverter-setup', 'Inverter Setup', 'Inverter installation and configuration.', 'Edit this description in the admin dashboard.', 2, true),
  ('repairs', 'Repairs', 'Repair of electrical, inverter and solar equipment.', 'Edit this description in the admin dashboard.', 3, true),
  ('maintenance', 'Electrical Maintenance', 'Routine electrical and solar system maintenance.', 'Edit this description in the admin dashboard.', 4, true),
  ('consultation', 'Consultation', 'Advice on the right solar and inverter setup for your needs.', 'Edit this description in the admin dashboard.', 5, true)
on conflict (slug) do nothing;