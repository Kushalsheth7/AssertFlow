-- Run this in your Supabase SQL Editor

-- Users table (Public Profile)
-- NOTE: Passwords are securely hashed and stored automatically by Supabase in the hidden `auth.users` table. 
-- We do NOT store passwords here for security reasons.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT,
  department TEXT
);

-- Assets table
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  tag TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  status TEXT,
  condition TEXT,
  "isShared" BOOLEAN DEFAULT FALSE,
  "qrCode" TEXT
);

-- Bookings table
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  "assetId" TEXT REFERENCES assets(id),
  "userId" TEXT REFERENCES users(id),
  date TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  status TEXT
);

-- Maintenance table
CREATE TABLE maintenance (
  id TEXT PRIMARY KEY,
  "assetId" TEXT REFERENCES assets(id),
  "requestedBy" TEXT REFERENCES users(id),
  issue TEXT NOT NULL,
  priority TEXT,
  status TEXT,
  "requestDate" TEXT
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  date TEXT NOT NULL
);

-- Initial Mock Data (Optional)
INSERT INTO users (id, name, email, role, department) 
VALUES ('1', 'Employee User', 'employee@assetflow.com', 'Employee', 'IT');

-- Storage Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');

-- Mock Assets Data
INSERT INTO assets (id, tag, name, category, location, status, condition, "isShared") VALUES 
('101', 'AF-0001', 'MacBook Pro M2', 'c1', 'Engineering Desk 4', 'Allocated', 'Excellent', false),
('102', 'AF-0002', 'Conference Room Projector', 'c1', 'Room B2', 'Available', 'Good', true),
('103', 'AF-0003', 'Herman Miller Chair', 'c2', 'HR Office', 'Available', 'Good', false),
('104', 'AF-0004', 'Delivery Van Ford Transit', 'c3', 'Parking Bay 1', 'Under Maintenance', 'Fair', true);

-- Mock Maintenance Data
INSERT INTO maintenance (id, "assetId", "requestedBy", issue, priority, status, "requestDate") VALUES
('m1', '104', '1', 'Engine light is on, needs oil change', 'High', 'In Progress', '2023-10-25T10:00:00Z');

-- Disable Row Level Security (RLS) for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;


