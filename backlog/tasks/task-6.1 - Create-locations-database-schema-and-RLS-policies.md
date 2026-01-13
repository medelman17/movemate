---
id: task-6.1
title: Create locations database schema and RLS policies
status: To Do
assignee: []
created_date: '2026-01-13 15:05'
labels:
  - database
  - supabase
dependencies: []
parent_task_id: task-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the locations table in Supabase with proper schema, indexes, and RLS policies.

## Schema
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_location_name UNIQUE(user_id, name)
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own locations"
  ON locations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_sort ON locations(user_id, sort_order);
```

## Items Table Change
```sql
ALTER TABLE items 
  ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX idx_items_location_id ON items(location_id);
```

## Deliverables
- Supabase migration file
- TypeScript types for Location
- Update Item type to include location_id
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 locations table created with all columns
- [ ] #2 RLS policy enforces user isolation
- [ ] #3 items.location_id FK added with SET NULL on delete
- [ ] #4 Indexes created for common queries
- [ ] #5 TypeScript types updated
<!-- AC:END -->
