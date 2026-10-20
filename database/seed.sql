-- =========================================================
-- Hospital Management System
-- Seed Data (v2) — runs after schema.sql
-- Seeds the super admin and default doctor categories.
-- Uses INSERT IGNORE so it is safe to re-run on every startup.
-- =========================================================

USE hospital_management_system;-- -----------------------------------------------------
-- 1. SUPER ADMIN (login: admin@medicare.com / admin)
-- Password hash for "admin" generated with bcrypt cost 10.
-- -----------------------------------------------------
INSERT IGNORE INTO users (name, email, password, role, status, hospital_id)
VALUES (
  'Super Admin',
  'admin@medicare.com',
  '$2b$10$dQ2MA/c3mQWei7nIV3VyNuDQKo0FUrXq4FlRrtfCCjVlG9.iS.B.O',
  'SUPER_ADMIN',
  'ACTIVE',
  NULL
);

-- -----------------------------------------------------
-- 2. Default doctor categories (shared by all hospitals)
-- -----------------------------------------------------
INSERT IGNORE INTO doctor_categories (category_name, description) VALUES
  ('General Physician','General medical care'),
  ('Dermatologist','Skin specialist'),
  ('Orthopedic','Bone and joint specialist'),
  ('Neurologist','Brain and nervous system specialist'),
  ('Cardiologist','Heart specialist'),
  ('Eye Specialist','Ophthalmology specialist'),
  ('ENT Specialist','Ear, Nose and Throat specialist'),
  ('Dentist','Dental specialist'),
  ('Pediatrician','Child specialist'),
  ('Psychiatrist','Mental health specialist');
