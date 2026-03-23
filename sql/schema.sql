-- Intern Management System - PostgreSQL Schema
-- Compatible with PostgreSQL 15+

BEGIN;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
   
 CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'intern');
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intern_status') THEN
    CREATE TYPE intern_status AS ENUM ('active', 'inactive');
  END IF;
END $$;

-- Core users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Intern profile table (extends users with intern-specific fields)
CREATE TABLE IF NOT EXISTS interns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT,
  mentor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  status intern_status NOT NULL DEFAULT 'active',
  college_name TEXT,
  university TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT interns_user_fk
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT interns_date_check
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Tasks created by admin/mentor
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to_all BOOLEAN NOT NULL DEFAULT FALSE,
  deadline DATE,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many task assignment (one task can be assigned to multiple interns)
CREATE TABLE IF NOT EXISTS task_assignments (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  intern_id TEXT NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, intern_id)
);

-- Intern daily/weekly reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  intern_id TEXT NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  work_description TEXT NOT NULL,
  hours_worked NUMERIC(4,2) NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
  mentor_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

CREATE INDEX IF NOT EXISTS idx_interns_mentor_id ON interns(mentor_id);
CREATE INDEX IF NOT EXISTS idx_interns_admin_id ON interns(admin_id);
CREATE INDEX IF NOT EXISTS idx_interns_department ON interns(department);
CREATE INDEX IF NOT EXISTS idx_interns_status ON interns(status);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_task_assignments_intern_id ON task_assignments(intern_id);

CREATE INDEX IF NOT EXISTS idx_reports_intern_id ON reports(intern_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);

-- Optional admin seed (safe to run multiple times)
INSERT INTO users (id, name, email, password_hash, role, department)
VALUES (
  'admin-1',
  'Aarav Shah',
  'admin@internship.com',
  '$2b$10$YtD0RcY3Y0xQ.Z07nNSIj.Y3KqvhVlZekws.RiPsK5OGMKgy1nmuu',
  'admin',
  'AI'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
