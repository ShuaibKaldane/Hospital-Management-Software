-- =========================================================
-- Hospital Management System
-- Production Database Schema (v2)
-- Adds SUPER_ADMIN role + hospital_id scoping on users.
-- =========================================================

CREATE DATABASE IF NOT EXISTS hospital_management_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE hospital_management_system;

-- =========================================================
-- 1. users
--    role values:
--      SUPER_ADMIN : platform-wide super admin
--      ADMIN       : tenant (hospital) admin
--      DOCTOR      : doctor (scoped to a hospital)
--      PATIENT     : patient (scoped to a hospital)
--
--    hospital_id is NULL for SUPER_ADMIN, set for everyone else.
-- =========================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN','ADMIN','DOCTOR','PATIENT') NOT NULL,
    status ENUM('ACTIVE','PENDING','BLOCKED') NOT NULL DEFAULT 'PENDING',
    hospital_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_hospital (hospital_id),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE doctor_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE doctor_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    hospital_id BIGINT NULL,
    category_id BIGINT NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    experience INT NOT NULL DEFAULT 0,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_doctor_category FOREIGN KEY (category_id)
        REFERENCES doctor_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_doctor_hospital (hospital_id)
) ENGINE=InnoDB;

CREATE TABLE patient_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    hospital_id BIGINT NULL,
    age INT,
    gender ENUM('Male','Female','Other'),
    blood_group VARCHAR(5),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_patient_hospital (hospital_id)
) ENGINE=InnoDB;

CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hospital_id BIGINT NULL,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Pending','Approved','Completed','Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_doctor FOREIGN KEY (doctor_id)
        REFERENCES users(id),
    CONSTRAINT fk_app_patient FOREIGN KEY (patient_id)
        REFERENCES users(id),
    INDEX idx_doctor_date (doctor_id, appointment_date),
    INDEX idx_patient (patient_id),
    INDEX idx_appointment_hospital (hospital_id)
) ENGINE=InnoDB;

CREATE TABLE patient_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hospital_id BIGINT NULL,
    appointment_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    report_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_hospital (hospital_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE prescriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hospital_id BIGINT NULL,
    appointment_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    diagnosis TEXT NOT NULL,
    medicines JSON NOT NULL,
    advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prescription_hospital (hospital_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hospital_id BIGINT NULL,
    appointment_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
    paid_at TIMESTAMP NULL,
    INDEX idx_payment_hospital (hospital_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE hospitals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    address VARCHAR(255),
    phone VARCHAR(20),
    admin_user_id BIGINT,
    plan VARCHAR(30) NOT NULL DEFAULT 'trial',
    trial TINYINT(1) NOT NULL DEFAULT 1,
    trial_expires_at DATETIME NULL,
    subscription_expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hospital_admin_user FOREIGN KEY (admin_user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_hospital_plan (plan),
    INDEX idx_hospital_trial (trial, trial_expires_at)
) ENGINE=InnoDB;

-- Add the FK from users.hospital_id -> hospitals.id after both tables exist.
ALTER TABLE users
    ADD CONSTRAINT fk_users_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill hospital_id on profile / transactional tables so the
-- existing FK chain still resolves when the admin row is set.
ALTER TABLE doctor_profiles
    ADD CONSTRAINT fk_doctor_profile_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE patient_profiles
    ADD CONSTRAINT fk_patient_profile_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE appointments
    ADD CONSTRAINT fk_appointment_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE patient_reports
    ADD CONSTRAINT fk_reports_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE prescriptions
    ADD CONSTRAINT fk_prescription_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE payments
    ADD CONSTRAINT fk_payment_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE doctor_salary_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hospital_id BIGINT NULL,
    doctor_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('Salary','Bonus','Deduction') NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_salary_doctor (doctor_id),
    INDEX idx_salary_hospital (hospital_id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
) ENGINE=InnoDB;

ALTER TABLE doctor_salary_transactions
    ADD CONSTRAINT fk_salary_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id) ON DELETE SET NULL ON UPDATE CASCADE;
