-- Add can_disassemble column to items table
alter table public.items 
add column if not exists can_disassemble boolean default false;
