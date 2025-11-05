# Subscription Database Design

## Overview
This document describes an optimized, flexible subscription database schema for managing user plans (Basic and Pro) with limits on tasks and monthly posts.

## Requirements
- **Basic Plan**: 1 task maximum, 5 posts per month
- **Pro Plan**: 10 tasks maximum, 40 posts per month

## Design Principles
- **Minimal Tables**: Keep the schema simple and maintainable
- **Flexible**: Easy to add new plans or modify limits
- **Optimized**: Efficient queries with proper indexes
- **Scalable**: Can handle usage tracking and billing cycles

---

## Database Schema

### 1. Subscription Plans (`subscription_plans`)
Defines the available subscription plans with their limits.

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- 'basic', 'pro'
  name TEXT NOT NULL, -- 'Basic Plan', 'Pro Plan'
  description TEXT,
  max_tasks INTEGER NOT NULL DEFAULT 1,
  max_monthly_posts INTEGER NOT NULL DEFAULT 5,
  price_monthly DECIMAL(10,2), -- Optional: for future billing
  price_yearly DECIMAL(10,2), -- Optional: for future billing
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible feature flags
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_plans_key ON subscription_plans(key) WHERE is_active = TRUE;
```

**Initial Data:**
```sql
INSERT INTO subscription_plans (key, name, description, max_tasks, max_monthly_posts, features) VALUES
  ('basic', 'Basic Plan', 'Perfect for getting started', 1, 5, '{"priority_support": false, "advanced_analytics": false}'::jsonb),
  ('pro', 'Pro Plan', 'For power users and creators', 10, 40, '{"priority_support": true, "advanced_analytics": true}'::jsonb);
```

---

### 2. User Subscriptions (`user_subscriptions`)
Tracks each user's current subscription and billing cycle.

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(), -- Start of current billing cycle
  current_period_end TIMESTAMPTZ NOT NULL, -- End of current billing cycle
  cancelled_at TIMESTAMPTZ, -- When subscription was cancelled
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible storage for billing info, payment provider IDs, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_user_subscription UNIQUE (user_id) WHERE status = 'active'
);

CREATE INDEX idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end) WHERE status = 'active';
```

**Notes:**
- One active subscription per user (enforced by unique constraint)
- `current_period_start` and `current_period_end` define the monthly billing cycle
- `metadata` can store payment provider IDs, invoice IDs, etc.

---

### 3. Usage Tracking (`usage_tracking`)
Tracks monthly usage for posts and tasks. This table is optimized for fast queries and aggregation.

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  tracking_period DATE NOT NULL, -- YYYY-MM-01 (first day of month)
  task_count INTEGER NOT NULL DEFAULT 0, -- Current number of tasks
  posts_count INTEGER NOT NULL DEFAULT 0, -- Current number of posts in this period
  last_task_created_at TIMESTAMPTZ, -- For tracking when last task was created
  last_post_at TIMESTAMPTZ, -- For tracking when last post was made
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Additional tracking data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_period UNIQUE (user_id, tracking_period)
);

CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, tracking_period DESC);
CREATE INDEX idx_usage_tracking_subscription_period ON usage_tracking(subscription_id, tracking_period DESC);
```

**Notes:**
- One row per user per month
- `tracking_period` is always the first day of the month (e.g., 2025-01-01)
- Counters are updated atomically to prevent race conditions
- Can be used for analytics and billing

---

### 4. Post History (`post_history`)
Tracks individual posts made to platforms for accurate usage counting and auditing.

```sql
CREATE TABLE post_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID, -- Reference to task/workflow that created this post
  platform TEXT NOT NULL, -- 'tiktok', 'youtube', 'instagram', 'facebook'
  platform_post_id TEXT, -- External platform post ID
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tracking_period DATE NOT NULL, -- YYYY-MM-01 for fast monthly queries
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'pending'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Video URL, caption, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_history_user_period ON post_history(user_id, tracking_period DESC);
CREATE INDEX idx_post_history_task ON post_history(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_post_history_posted_at ON post_history(posted_at DESC);
```

**Notes:**
- Each post increments the monthly counter in `usage_tracking`
- `tracking_period` is denormalized for fast monthly queries
- Can be used for analytics and audit trails

---

### 5. Invoices (`invoices`)
Tracks invoices generated for subscription billing cycles.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE, -- Human-readable invoice number (e.g., INV-2025-001)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  period_start TIMESTAMPTZ NOT NULL, -- Billing period start
  period_end TIMESTAMPTZ NOT NULL, -- Billing period end
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000, -- e.g., 0.1000 for 10%
  paid_at TIMESTAMPTZ, -- When invoice was fully paid
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Amount actually paid
  notes TEXT, -- Internal notes
  customer_notes TEXT, -- Notes visible to customer
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Payment provider invoice ID, PDF URL, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('pending', 'overdue');
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);
```

**Notes:**
- One invoice per billing cycle per subscription
- `invoice_number` is human-readable and unique
- Supports multiple currencies and tax calculations
- `metadata` can store PDF URLs, payment provider invoice IDs, etc.

---

### 6. Invoice Items (`invoice_items`)
Line items for each invoice (subscription fees, add-ons, discounts, etc.).

```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'subscription', 'addon', 'discount', 'tax', 'fee'
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- quantity * unit_price
  currency TEXT NOT NULL DEFAULT 'USD',
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL, -- For subscription items
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible storage for item-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_type ON invoice_items(item_type);
```

**Notes:**
- Flexible item types for different charge types
- `total_price` = `quantity * unit_price` (can be negative for discounts)
- Supports multiple currencies per invoice item

---

### 7. Payments (`payments`)
Tracks payment transactions for invoices.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT NOT NULL UNIQUE, -- Human-readable payment number (e.g., PAY-2025-001)
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  payment_method TEXT NOT NULL, -- 'credit_card', 'debit_card', 'paypal', 'bank_transfer', 'stripe', 'other'
  payment_provider TEXT, -- 'stripe', 'paypal', 'square', etc.
  payment_provider_id TEXT, -- External payment provider transaction ID
  payment_provider_response JSONB, -- Full response from payment provider
  transaction_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Processing fee
  refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- If refunded
  refunded_at TIMESTAMPTZ, -- When refund was processed
  refund_reason TEXT, -- Reason for refund
  paid_at TIMESTAMPTZ, -- When payment was completed
  failed_at TIMESTAMPTZ, -- When payment failed
  failure_reason TEXT, -- Reason for failure
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Additional payment data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_payments_subscription ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_payments_provider_id ON payments(payment_provider, payment_provider_id) WHERE payment_provider IS NOT NULL;
CREATE INDEX idx_payments_status_date ON payments(status, paid_at DESC) WHERE status = 'completed';
```

**Notes:**
- One invoice can have multiple payments (partial payments, refunds, etc.)
- Tracks payment provider integration details
- Supports refunds and partial payments
- `metadata` can store payment method details (last 4 digits, card type, etc.)

---

### 8. Payment Methods (`payment_methods`) - Optional
Stores user payment methods for recurring billing.

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_provider TEXT NOT NULL, -- 'stripe', 'paypal', etc.
  provider_payment_method_id TEXT NOT NULL, -- External payment method ID
  payment_type TEXT NOT NULL, -- 'card', 'bank_account', 'paypal', etc.
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_four TEXT, -- Last 4 digits of card/account
  card_brand TEXT, -- 'visa', 'mastercard', 'amex', etc. (for cards)
  card_exp_month INTEGER, -- Expiration month (for cards)
  card_exp_year INTEGER, -- Expiration year (for cards)
  billing_address JSONB, -- Full billing address
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Additional payment method data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  CONSTRAINT unique_provider_method UNIQUE (user_id, payment_provider, provider_payment_method_id)
);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = TRUE AND deleted_at IS NULL;
```

**Notes:**
- Optional table for storing payment methods
- Supports multiple payment methods per user
- Soft delete for security and audit trail
- One default payment method per user

---

## Helper Functions & Triggers

### Function: Get Current Usage
```sql
CREATE OR REPLACE FUNCTION get_user_current_usage(p_user_id UUID)
RETURNS TABLE (
  task_count INTEGER,
  posts_count INTEGER,
  max_tasks INTEGER,
  max_posts INTEGER,
  period_start DATE,
  period_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ut.task_count,
    ut.posts_count,
    sp.max_tasks,
    sp.max_monthly_posts,
    ut.tracking_period AS period_start,
    (ut.tracking_period + INTERVAL '1 month' - INTERVAL '1 day')::DATE AS period_end
  FROM usage_tracking ut
  INNER JOIN user_subscriptions us ON ut.subscription_id = us.id
  INNER JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE ut.user_id = p_user_id
    AND ut.tracking_period = DATE_TRUNC('month', CURRENT_DATE)::DATE
    AND us.status = 'active';
END;
$$ LANGUAGE plpgsql;
```

### Function: Increment Post Count
```sql
CREATE OR REPLACE FUNCTION increment_post_count(
  p_user_id UUID,
  p_subscription_id UUID,
  p_posted_at TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  v_period DATE;
BEGIN
  v_period := DATE_TRUNC('month', p_posted_at)::DATE;
  
  INSERT INTO usage_tracking (user_id, subscription_id, tracking_period, posts_count, last_post_at)
  VALUES (p_user_id, p_subscription_id, v_period, 1, p_posted_at)
  ON CONFLICT (user_id, tracking_period)
  DO UPDATE SET
    posts_count = usage_tracking.posts_count + 1,
    last_post_at = p_posted_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
```

### Function: Update Task Count
```sql
CREATE OR REPLACE FUNCTION update_task_count(
  p_user_id UUID,
  p_subscription_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_period DATE;
  v_current_count INTEGER;
BEGIN
  v_period := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Get current task count from tasks table (assuming tasks table exists)
  SELECT COUNT(*) INTO v_current_count
  FROM tasks
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  INSERT INTO usage_tracking (user_id, subscription_id, tracking_period, task_count, last_task_created_at)
  VALUES (p_user_id, p_subscription_id, v_period, v_current_count, now())
  ON CONFLICT (user_id, tracking_period)
  DO UPDATE SET
    task_count = v_current_count,
    last_task_created_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
```

### Trigger: Auto-increment Post Count
```sql
CREATE OR REPLACE FUNCTION trigger_increment_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Get active subscription for user
  PERFORM increment_post_count(
    NEW.user_id,
    (SELECT id FROM user_subscriptions WHERE user_id = NEW.user_id AND status = 'active' LIMIT 1),
    NEW.posted_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_created
AFTER INSERT ON post_history
FOR EACH ROW
EXECUTE FUNCTION trigger_increment_post_count();
```

---

## Query Examples

### Check if user can create a task
```sql
SELECT 
  ut.task_count < sp.max_tasks AS can_create_task
FROM usage_tracking ut
INNER JOIN user_subscriptions us ON ut.subscription_id = us.id
INNER JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE ut.user_id = $1
  AND ut.tracking_period = DATE_TRUNC('month', CURRENT_DATE)::DATE
  AND us.status = 'active';
```

### Check if user can post (within monthly limit)
```sql
SELECT 
  ut.posts_count < sp.max_monthly_posts AS can_post
FROM usage_tracking ut
INNER JOIN user_subscriptions us ON ut.subscription_id = us.id
INNER JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE ut.user_id = $1
  AND ut.tracking_period = DATE_TRUNC('month', CURRENT_DATE)::DATE
  AND us.status = 'active';
```

### Get user subscription details
```sql
SELECT 
  sp.key AS plan_key,
  sp.name AS plan_name,
  sp.max_tasks,
  sp.max_monthly_posts,
  ut.task_count AS current_tasks,
  ut.posts_count AS current_posts,
  sp.max_tasks - ut.task_count AS tasks_remaining,
  sp.max_monthly_posts - ut.posts_count AS posts_remaining,
  us.current_period_start,
  us.current_period_end
FROM user_subscriptions us
INNER JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN usage_tracking ut ON ut.user_id = us.user_id 
  AND ut.tracking_period = DATE_TRUNC('month', CURRENT_DATE)::DATE
WHERE us.user_id = $1 AND us.status = 'active';
```

### Get monthly usage history
```sql
SELECT 
  tracking_period,
  task_count,
  posts_count,
  last_task_created_at,
  last_post_at
FROM usage_tracking
WHERE user_id = $1
ORDER BY tracking_period DESC
LIMIT 12; -- Last 12 months
```

---

## Migration Strategy

### Step 1: Create tables
Run all `CREATE TABLE` statements in order.

### Step 2: Insert initial plans
```sql
INSERT INTO subscription_plans (key, name, description, max_tasks, max_monthly_posts, features) VALUES
  ('basic', 'Basic Plan', 'Perfect for getting started', 1, 5, '{}'::jsonb),
  ('pro', 'Pro Plan', 'For power users and creators', 10, 40, '{}'::jsonb);
```

### Step 3: Migrate existing users
```sql
-- Assign Basic plan to all existing users (or your default)
INSERT INTO user_subscriptions (user_id, plan_id, current_period_end)
SELECT 
  u.id,
  (SELECT id FROM subscription_plans WHERE key = 'basic'),
  (CURRENT_DATE + INTERVAL '1 month')::TIMESTAMPTZ
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
);
```

### Step 4: Initialize usage tracking
```sql
-- Initialize current month usage for all active subscriptions
INSERT INTO usage_tracking (user_id, subscription_id, tracking_period, task_count, posts_count)
SELECT 
  us.user_id,
  us.id,
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  COALESCE((SELECT COUNT(*) FROM tasks WHERE user_id = us.user_id AND deleted_at IS NULL), 0),
  COALESCE((SELECT COUNT(*) FROM post_history WHERE user_id = us.user_id AND tracking_period = DATE_TRUNC('month', CURRENT_DATE)::DATE), 0)
FROM user_subscriptions us
WHERE us.status = 'active'
ON CONFLICT (user_id, tracking_period) DO NOTHING;
```

---

## Benefits of This Design

1. **Minimal Tables**: Only 8 core tables for the complete subscription and billing system
2. **Flexible**: Easy to add new plans or modify limits via `subscription_plans` table
3. **Optimized**: Indexes on frequently queried columns (user_id, tracking_period, invoice_number, etc.)
4. **Scalable**: Denormalized tracking period for fast monthly queries
5. **Auditable**: Complete history of posts, invoices, and payments
6. **Extensible**: JSONB fields allow storing additional metadata without schema changes
7. **Performance**: Atomic counter updates prevent race conditions
8. **Clean Separation**: Subscription logic separate from core business tables
9. **Payment Integration Ready**: Supports multiple payment providers (Stripe, PayPal, etc.)
10. **Comprehensive Billing**: Full invoice generation, payment tracking, and refund support

---

## Invoice & Payment Helper Functions

### Function: Generate Invoice for Subscription
```sql
CREATE OR REPLACE FUNCTION generate_subscription_invoice(
  p_subscription_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_user_id UUID;
  v_plan_id UUID;
  v_plan_price DECIMAL(10,2);
  v_invoice_number TEXT;
  v_subtotal DECIMAL(10,2);
  v_tax_amount DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_tax_rate DECIMAL(5,4) := 0.0000; -- Default 0% tax, adjust as needed
  v_due_date DATE;
BEGIN
  -- Get subscription details
  SELECT us.user_id, us.plan_id, sp.price_monthly
  INTO v_user_id, v_plan_id, v_plan_price
  FROM user_subscriptions us
  INNER JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.id = p_subscription_id AND us.status = 'active';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Active subscription not found';
  END IF;
  
  -- Generate invoice number
  v_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
    LPAD(COALESCE((SELECT MAX(CAST(SUBSTRING(invoice_number FROM '(\d+)$') AS INTEGER)) FROM invoices 
      WHERE invoice_number LIKE 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%'), 0) + 1::TEXT, 4, '0');
  
  -- Calculate amounts
  v_subtotal := COALESCE(v_plan_price, 0.00);
  v_tax_amount := v_subtotal * v_tax_rate;
  v_total := v_subtotal + v_tax_amount;
  
  -- Due date is 7 days from invoice date
  v_due_date := CURRENT_DATE + INTERVAL '7 days';
  
  -- Create invoice
  INSERT INTO invoices (
    invoice_number, user_id, subscription_id, status, invoice_date, due_date,
    period_start, period_end, subtotal, tax_amount, total_amount, tax_rate
  )
  VALUES (
    v_invoice_number, v_user_id, p_subscription_id, 'pending', CURRENT_DATE, v_due_date,
    p_period_start, p_period_end, v_subtotal, v_tax_amount, v_total, v_tax_rate
  )
  RETURNING id INTO v_invoice_id;
  
  -- Add subscription line item
  INSERT INTO invoice_items (
    invoice_id, item_type, description, quantity, unit_price, total_price, plan_id
  )
  VALUES (
    v_invoice_id, 'subscription', 
    'Subscription fee for ' || (SELECT name FROM subscription_plans WHERE id = v_plan_id),
    1, v_plan_price, v_plan_price, v_plan_id
  );
  
  -- Add tax line item if applicable
  IF v_tax_amount > 0 THEN
    INSERT INTO invoice_items (
      invoice_id, item_type, description, quantity, unit_price, total_price
    )
    VALUES (
      v_invoice_id, 'tax', 'Tax', 1, v_tax_amount, v_tax_amount
    );
  END IF;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
```

### Function: Record Payment
```sql
CREATE OR REPLACE FUNCTION record_payment(
  p_invoice_id UUID,
  p_amount DECIMAL(10,2),
  p_payment_method TEXT,
  p_payment_provider TEXT DEFAULT NULL,
  p_payment_provider_id TEXT DEFAULT NULL,
  p_payment_provider_response JSONB DEFAULT '{}'::jsonb,
  p_transaction_fee DECIMAL(10,2) DEFAULT 0.00
)
RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
  v_payment_number TEXT;
  v_user_id UUID;
  v_subscription_id UUID;
  v_invoice_total DECIMAL(10,2);
  v_paid_amount DECIMAL(10,2);
  v_status TEXT := 'completed';
BEGIN
  -- Get invoice details
  SELECT user_id, subscription_id, total_amount, paid_amount
  INTO v_user_id, v_subscription_id, v_invoice_total, v_paid_amount
  FROM invoices
  WHERE id = p_invoice_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;
  
  -- Generate payment number
  v_payment_number := 'PAY-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
    LPAD(COALESCE((SELECT MAX(CAST(SUBSTRING(payment_number FROM '(\d+)$') AS INTEGER)) FROM payments 
      WHERE payment_number LIKE 'PAY-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%'), 0) + 1::TEXT, 4, '0');
  
  -- Create payment record
  INSERT INTO payments (
    payment_number, invoice_id, user_id, subscription_id, amount, payment_method,
    payment_provider, payment_provider_id, payment_provider_response, transaction_fee,
    status, paid_at
  )
  VALUES (
    v_payment_number, p_invoice_id, v_user_id, v_subscription_id, p_amount, p_payment_method,
    p_payment_provider, p_payment_provider_id, p_payment_provider_response, p_transaction_fee,
    v_status, now()
  )
  RETURNING id INTO v_payment_id;
  
  -- Update invoice paid amount and status
  UPDATE invoices
  SET 
    paid_amount = paid_amount + p_amount,
    status = CASE 
      WHEN (paid_amount + p_amount) >= total_amount THEN 'paid'
      ELSE 'pending'
    END,
    paid_at = CASE 
      WHEN (paid_amount + p_amount) >= total_amount THEN now()
      ELSE paid_at
    END,
    updated_at = now()
  WHERE id = p_invoice_id;
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;
```

### Function: Process Refund
```sql
CREATE OR REPLACE FUNCTION process_refund(
  p_payment_id UUID,
  p_refund_amount DECIMAL(10,2),
  p_refund_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_invoice_id UUID;
  v_payment_amount DECIMAL(10,2);
  v_current_refund DECIMAL(10,2);
BEGIN
  -- Get payment details
  SELECT invoice_id, amount, refund_amount
  INTO v_invoice_id, v_payment_amount, v_current_refund
  FROM payments
  WHERE id = p_payment_id AND status = 'completed';
  
  IF v_invoice_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found or not completed';
  END IF;
  
  IF (v_current_refund + p_refund_amount) > v_payment_amount THEN
    RAISE EXCEPTION 'Refund amount exceeds payment amount';
  END IF;
  
  -- Update payment
  UPDATE payments
  SET 
    refund_amount = refund_amount + p_refund_amount,
    refunded_at = now(),
    refund_reason = p_refund_reason,
    status = CASE 
      WHEN (refund_amount + p_refund_amount) >= amount THEN 'refunded'
      ELSE 'completed'
    END,
    updated_at = now()
  WHERE id = p_payment_id;
  
  -- Update invoice
  UPDATE invoices
  SET 
    paid_amount = GREATEST(0, paid_amount - p_refund_amount),
    status = CASE 
      WHEN (paid_amount - p_refund_amount) <= 0 THEN 'pending'
      ELSE 'paid'
    END,
    paid_at = CASE 
      WHEN (paid_amount - p_refund_amount) <= 0 THEN NULL
      ELSE paid_at
    END,
    updated_at = now()
  WHERE id = v_invoice_id;
END;
$$ LANGUAGE plpgsql;
```

### Trigger: Auto-update Invoice Total
```sql
CREATE OR REPLACE FUNCTION trigger_update_invoice_total()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(10,2);
  v_tax_rate DECIMAL(5,4);
  v_tax_amount DECIMAL(10,2);
  v_total DECIMAL(10,2);
BEGIN
  -- Recalculate invoice totals when items change
  SELECT 
    COALESCE(SUM(total_price), 0.00),
    MAX(i.tax_rate)
  INTO v_subtotal, v_tax_rate
  FROM invoice_items ii
  INNER JOIN invoices i ON ii.invoice_id = i.id
  WHERE ii.invoice_id = NEW.invoice_id
    AND ii.item_type != 'tax';
  
  v_tax_amount := v_subtotal * COALESCE(v_tax_rate, 0.0000);
  v_total := v_subtotal + v_tax_amount;
  
  UPDATE invoices
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total,
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invoice_item_changed
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION trigger_update_invoice_total();
```

---

## Invoice & Payment Query Examples

### Get user invoices with payment status
```sql
SELECT 
  i.id,
  i.invoice_number,
  i.invoice_date,
  i.due_date,
  i.period_start,
  i.period_end,
  i.subtotal,
  i.tax_amount,
  i.total_amount,
  i.paid_amount,
  i.total_amount - i.paid_amount AS balance,
  i.status,
  i.currency,
  sp.name AS plan_name,
  COUNT(p.id) AS payment_count,
  MAX(p.paid_at) AS last_payment_at
FROM invoices i
INNER JOIN user_subscriptions us ON i.subscription_id = us.id
INNER JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN payments p ON p.invoice_id = i.id AND p.status = 'completed'
WHERE i.user_id = $1
GROUP BY i.id, sp.name
ORDER BY i.invoice_date DESC;
```

### Get invoice details with line items
```sql
SELECT 
  i.*,
  json_agg(
    json_build_object(
      'id', ii.id,
      'type', ii.item_type,
      'description', ii.description,
      'quantity', ii.quantity,
      'unit_price', ii.unit_price,
      'total_price', ii.total_price
    )
  ) AS items
FROM invoices i
LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
WHERE i.id = $1
GROUP BY i.id;
```

### Get payment history for user
```sql
SELECT 
  p.id,
  p.payment_number,
  p.amount,
  p.currency,
  p.status,
  p.payment_method,
  p.payment_provider,
  p.paid_at,
  p.transaction_fee,
  p.refund_amount,
  i.invoice_number,
  i.invoice_date
FROM payments p
INNER JOIN invoices i ON p.invoice_id = i.id
WHERE p.user_id = $1
ORDER BY p.paid_at DESC NULLS LAST, p.created_at DESC;
```

### Get overdue invoices
```sql
SELECT 
  i.id,
  i.invoice_number,
  i.user_id,
  u.email,
  u.display_name,
  i.due_date,
  i.total_amount,
  i.paid_amount,
  i.total_amount - i.paid_amount AS balance,
  CURRENT_DATE - i.due_date AS days_overdue
FROM invoices i
INNER JOIN users u ON i.user_id = u.id
WHERE i.status IN ('pending', 'overdue')
  AND i.due_date < CURRENT_DATE
ORDER BY i.due_date ASC;
```

### Get monthly revenue summary
```sql
SELECT 
  DATE_TRUNC('month', p.paid_at) AS month,
  COUNT(DISTINCT p.id) AS payment_count,
  COUNT(DISTINCT p.user_id) AS unique_customers,
  SUM(p.amount) AS total_revenue,
  SUM(p.transaction_fee) AS total_fees,
  SUM(p.amount - p.transaction_fee) AS net_revenue
FROM payments p
WHERE p.status = 'completed'
  AND p.paid_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', p.paid_at)
ORDER BY month DESC;
```

### Get subscription invoices for billing cycle
```sql
SELECT 
  i.*,
  sp.name AS plan_name,
  sp.key AS plan_key
FROM invoices i
INNER JOIN user_subscriptions us ON i.subscription_id = us.id
INNER JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.id = $1
  AND i.period_start >= $2
  AND i.period_end <= $3
ORDER BY i.period_start DESC;
```

---

## Future Enhancements

- Add `subscription_usage_alerts` for notifications when limits are reached
- Add `plan_upgrades` table to track upgrade/downgrade history
- Add `trial_subscriptions` table if trial periods are needed
- Add `coupon_codes` table for discounts
- Add `subscription_webhooks` for payment provider integration
- Add `invoice_templates` table for custom invoice formatting
- Add `payment_reminders` table for automated email reminders

---

## Notes

- This design assumes tasks are tracked in a separate `tasks` table (not shown here)
- Monthly limits reset at the start of each billing cycle (defined by `current_period_start`/`current_period_end`)
- Task count is calculated from the actual tasks table, not just incremented (to handle deletions)
- Post count is incremented atomically to prevent race conditions
- All timestamps use `TIMESTAMPTZ` for timezone-aware operations
- Invoice numbers are auto-generated and unique (format: INV-YYYY-####)
- Payment numbers are auto-generated and unique (format: PAY-YYYY-####)
- Supports partial payments and refunds
- Tax calculation is configurable per invoice (can be set to 0% or configured per region)
- Payment methods table is optional - can be removed if not storing payment methods
- All monetary amounts use `DECIMAL(10,2)` for precision (supports up to $99,999,999.99)

