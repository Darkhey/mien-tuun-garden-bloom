
-- Erstellt Bucket für Rezeptbilder
insert into storage.buckets (id, name, public) values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Erstellt Bucket für Blogbilder
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Erstellt Bucket für Nutzerprofilbilder/Avatare
insert into storage.buckets (id, name, public) values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;
