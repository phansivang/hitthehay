# Design flexible and optimized database table
_Exported on 11/4/2025 at 01:07:43 GMT+7 from Cursor (2.0.43)_

---

**User**

design the table for me base on the codebase for business model, so make sure the table is flexible and easy to extend and optimization for query 

---

**Cursor**

### Clarifying scope
I’ll propose a PostgreSQL schema that fits your current app entities (auth, admin/users/roles, workflows/editor, tasks, content library, analytics, audit logs, settings), with multi-tenant support, versioned workflows, flexible metadata via JSONB, and query-oriented indexes. It’s designed to be extensible and performant.

### Core conventions
- UUID primary keys, short surrogate integer IDs optional for human references
- `organization_id` on multi-tenant tables
- `created_at`, `updated_at`, `deleted_at` (soft delete where useful)
- `metadata JSONB` for extensibility with GIN indexes on frequently queried keys
- Status columns as constrained text or FK to lookup tables
- Composite indexes for common filters and pagination
- Referential integrity with cascade rules appropriate to your UI

### Auth, Users, Roles, Permissions

```sql
-- Organizations / Tenancy
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  auth_provider TEXT, -- 'password', 'google', etc.
  auth_provider_id TEXT, -- provider user id
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_users_metadata_gin ON users USING GIN (metadata);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- Permissions (capabilities used in admin/settings/moderation)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- e.g. 'tasks.moderate', 'workflows.edit'
  description TEXT
);

-- Role-Permissions
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User-Roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Sessions (optional; or managed by your auth provider)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sessions_user_expires ON sessions(user_id, expires_at);
```

### Content Library

```sql
CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  mime_type TEXT,
  storage_url TEXT NOT NULL,
  checksum TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'deleted'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assets_org_status_updated ON content_assets(organization_id, status, updated_at DESC);
CREATE INDEX idx_assets_tags_gin ON content_assets USING GIN (tags);
CREATE INDEX idx_assets_metadata_gin ON content_assets USING GIN (metadata);
```

### Workflows and Editor (versioned graphs: nodes + edges + settings)

```sql
-- Logical workflow definition
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  latest_version INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- Immutable versions for reproducibility
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  version INT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb, -- editor-level config
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (workflow_id, version)
);

CREATE INDEX idx_wf_versions_workflow_version ON workflow_versions(workflow_id, version);

-- Nodes
CREATE TABLE workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_version_id UUID REFERENCES workflow_versions(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- stable node key in editor
  type TEXT NOT NULL, -- matches `CustomNode` types
  position JSONB NOT NULL, -- {x, y}
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- node settings
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (workflow_version_id, key)
);

CREATE INDEX idx_wf_nodes_version_type ON workflow_nodes(workflow_version_id, type);
CREATE INDEX idx_wf_nodes_config_gin ON workflow_nodes USING GIN (config);

-- Edges
CREATE TABLE workflow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_version_id UUID REFERENCES workflow_versions(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  target_key TEXT NOT NULL,
  label TEXT,
  condition JSONB, -- conditional routing info
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_wf_edges_version ON workflow_edges(workflow_version_id);

-- Executions / Runs
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  workflow_version_id UUID REFERENCES workflow_versions(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'queued','running','succeeded','failed','cancelled'
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  input JSONB,
  output JSONB,
  error JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wf_runs_org_status_time ON workflow_runs(organization_id, status, created_at DESC);
CREATE INDEX idx_wf_runs_workflow_time ON workflow_runs(workflow_id, created_at DESC);
```

### Tasks and Moderation

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open','in_progress','blocked','resolved','closed'
  priority INT NOT NULL DEFAULT 3, -- 1=highest
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_org_status_prio ON tasks(organization_id, status, priority, updated_at DESC);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status, updated_at DESC);
CREATE INDEX idx_tasks_tags_gin ON tasks USING GIN (tags);
CREATE INDEX idx_tasks_metadata_gin ON tasks USING GIN (metadata);

-- Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_task_comments_task_time ON task_comments(task_id, created_at DESC);

-- Attachments
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES content_assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Moderation queue
CREATE TABLE moderation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  content_asset_id UUID REFERENCES content_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending','approved','rejected'
  reason TEXT,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mod_items_org_status_time ON moderation_items(organization_id, status, created_at DESC);
```

### Analytics and Audit Logs

```sql
-- Event-level analytics (append-only, partitioned by month for scale)
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL, -- e.g. 'task.view','workflow.run.start'
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  subject_type TEXT, -- 'task','workflow','asset'
  subject_id UUID,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions out-of-band (or use a trigger/cron)
-- Indexes for querying
CREATE INDEX idx_analytics_org_event_time ON analytics_events (organization_id, event_key, occurred_at DESC);
CREATE INDEX idx_analytics_props_gin ON analytics_events USING GIN (properties);

-- Audit log (immutable)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'user.create','role.update','task.delete'
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  ip INET,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org_entity_time ON audit_logs(organization_id, entity_type, occurred_at DESC);
CREATE INDEX idx_audit_action_time ON audit_logs(action, occurred_at DESC);
```

### Settings and Configuration

```sql
-- Scoped settings with override precedence: org > role > user
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL, -- 'org','role','user'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (scope = 'org' AND organization_id IS NOT NULL AND role_id IS NULL AND user_id IS NULL) OR
    (scope = 'role' AND role_id IS NOT NULL AND user_id IS NULL) OR
    (scope = 'user' AND user_id IS NOT NULL)
  ),
  UNIQUE (scope, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(role_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), key)
);

CREATE INDEX idx_settings_scope_key ON settings(scope, key);
```

### Optional: Platform Accounts (social integrations hinted by assets)

```sql
CREATE TABLE platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'tiktok','youtube','instagram','facebook'
  handle TEXT,
  external_id TEXT,
  access_token TEXT, -- or store in a vault and keep reference here
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, platform, COALESCE(external_id, ''), COALESCE(handle, ''))
);

CREATE INDEX idx_platform_accounts_org_platform ON platform_accounts(organization_id, platform);
```

### Query and extension notes
- Common list queries:
  - Tasks: filter by `organization_id`, `status`, `assignee_id`, tags, with pagination by `(updated_at, id)` using the `idx_tasks_org_status_prio` and `idx_tasks_assignee_status`.
  - Workflows: fetch latest version via `workflows.latest_version` or join `workflow_versions` on `(workflow_id, version)`.
  - Content library: filter by tags and metadata (GIN indexes).
  - Analytics/Audit: time-bounded queries with composite indexes; partition `analytics_events` by time for scale.
- Extensibility:
  - Add new workflow node types without migrations via `workflow_nodes.type` + JSONB `config`.
  - Add new moderation states or task statuses by lookup tables later, or keep constrained text now.
  - New permissions simply insert into `permissions`; role assignments don’t require schema changes.
- Integrity:
  - Use triggers to maintain `workflows.latest_version`.
  - Consider row-level security (RLS) keyed on `organization_id`.
- Performance:
  - Use partial indexes for hot filters, e.g. open tasks:
    ```sql
    CREATE INDEX idx_tasks_open ON tasks(status, organization_id, updated_at DESC) WHERE status IN ('open','in_progress','blocked');
    ```
  - Add GIN indexes on specific JSONB paths when they become hot:
    ```sql
    CREATE INDEX idx_wf_runs_metadata_gin ON workflow_runs USING GIN (metadata);
    ```

If you want, I can tailor indexes to your most frequent UI screens (e.g., `TaskList` filters, `WorkflowEditor` loads) or provide migrations (SQL or Prisma/Drizzle/TypeORM) based on your stack.

```sql
-- Organizations / Tenancy
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  auth_provider TEXT, -- 'password', 'google', etc.
  auth_provider_id TEXT, -- provider user id
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_users_metadata_gin ON users USING GIN (metadata);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- Permissions (capabilities used in admin/settings/moderation)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- e.g. 'tasks.moderate', 'workflows.edit'
  description TEXT
);

-- Role-Permissions
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User-Roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Sessions (optional; or managed by your auth provider)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sessions_user_expires ON sessions(user_id, expires_at);
```

```sql
CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  mime_type TEXT,
  storage_url TEXT NOT NULL,
  checksum TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'deleted'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assets_org_status_updated ON content_assets(organization_id, status, updated_at DESC);
CREATE INDEX idx_assets_tags_gin ON content_assets USING GIN (tags);
CREATE INDEX idx_assets_metadata_gin ON content_assets USING GIN (metadata);
```

```sql
-- Logical workflow definition
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  latest_version INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- Immutable versions for reproducibility
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  version INT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb, -- editor-level config
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (workflow_id, version)
);

CREATE INDEX idx_wf_versions_workflow_version ON workflow_versions(workflow_id, version);

-- Nodes
CREATE TABLE workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_version_id UUID REFERENCES workflow_versions(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- stable node key in editor
  type TEXT NOT NULL, -- matches `CustomNode` types
  position JSONB NOT NULL, -- {x, y}
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- node settings
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (workflow_version_id, key)
);

CREATE INDEX idx_wf_nodes_version_type ON workflow_nodes(workflow_version_id, type);
CREATE INDEX idx_wf_nodes_config_gin ON workflow_nodes USING GIN (config);

-- Edges
CREATE TABLE workflow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_version_id UUID REFERENCES workflow_versions(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  target_key TEXT NOT NULL,
  label TEXT,
  condition JSONB, -- conditional routing info
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_wf_edges_version ON workflow_edges(workflow_version_id);

-- Executions / Runs
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  workflow_version_id UUID REFERENCES workflow_versions(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'queued','running','succeeded','failed','cancelled'
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  input JSONB,
  output JSONB,
  error JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wf_runs_org_status_time ON workflow_runs(organization_id, status, created_at DESC);
CREATE INDEX idx_wf_runs_workflow_time ON workflow_runs(workflow_id, created_at DESC);
```

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open','in_progress','blocked','resolved','closed'
  priority INT NOT NULL DEFAULT 3, -- 1=highest
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_org_status_prio ON tasks(organization_id, status, priority, updated_at DESC);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status, updated_at DESC);
CREATE INDEX idx_tasks_tags_gin ON tasks USING GIN (tags);
CREATE INDEX idx_tasks_metadata_gin ON tasks USING GIN (metadata);

-- Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_task_comments_task_time ON task_comments(task_id, created_at DESC);

-- Attachments
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES content_assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Moderation queue
CREATE TABLE moderation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  content_asset_id UUID REFERENCES content_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending','approved','rejected'
  reason TEXT,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mod_items_org_status_time ON moderation_items(organization_id, status, created_at DESC);
```

```sql
-- Event-level analytics (append-only, partitioned by month for scale)
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL, -- e.g. 'task.view','workflow.run.start'
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  subject_type TEXT, -- 'task','workflow','asset'
  subject_id UUID,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions out-of-band (or use a trigger/cron)
-- Indexes for querying
CREATE INDEX idx_analytics_org_event_time ON analytics_events (organization_id, event_key, occurred_at DESC);
CREATE INDEX idx_analytics_props_gin ON analytics_events USING GIN (properties);

-- Audit log (immutable)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'user.create','role.update','task.delete'
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  ip INET,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org_entity_time ON audit_logs(organization_id, entity_type, occurred_at DESC);
CREATE INDEX idx_audit_action_time ON audit_logs(action, occurred_at DESC);
```

```sql
-- Scoped settings with override precedence: org > role > user
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL, -- 'org','role','user'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (scope = 'org' AND organization_id IS NOT NULL AND role_id IS NULL AND user_id IS NULL) OR
    (scope = 'role' AND role_id IS NOT NULL AND user_id IS NULL) OR
    (scope = 'user' AND user_id IS NOT NULL)
  ),
  UNIQUE (scope, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(role_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), key)
);

CREATE INDEX idx_settings_scope_key ON settings(scope, key);
```

```sql
CREATE TABLE platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'tiktok','youtube','instagram','facebook'
  handle TEXT,
  external_id TEXT,
  access_token TEXT, -- or store in a vault and keep reference here
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, platform, COALESCE(external_id, ''), COALESCE(handle, ''))
);

CREATE INDEX idx_platform_accounts_org_platform ON platform_accounts(organization_id, platform);
```

```sql
    CREATE INDEX idx_tasks_open ON tasks(status, organization_id, updated_at DESC) WHERE status IN ('open','in_progress','blocked');
    ```
  - Add GIN indexes on specific JSONB paths when they become hot:
    ```sql
    CREATE INDEX idx_wf_runs_metadata_gin ON workflow_runs USING GIN (metadata);
    ```

If you want, I can tailor indexes to your most frequent UI screens (e.g., `TaskList` filters, `WorkflowEditor` loads) or provide migrations (SQL or Prisma/Drizzle/TypeORM) based on your stack.
```

```sql
    CREATE INDEX idx_wf_runs_metadata_gin ON workflow_runs USING GIN (metadata);
```

