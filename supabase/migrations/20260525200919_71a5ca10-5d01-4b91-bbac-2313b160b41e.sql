alter table realtime.messages enable row level security;

drop policy if exists "Users can subscribe to own notifications channel" on realtime.messages;

create policy "Users can subscribe to own notifications channel"
on realtime.messages
for select
to authenticated
using (
  (select realtime.topic()) = ('notifications:' || (select auth.uid())::text)
);