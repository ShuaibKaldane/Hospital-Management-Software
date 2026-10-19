-- =========================================================
-- Migration: 001_create_hospitals.sql
-- Adds the `hospitals` table used by the trial flow
-- (and any future self-serve plan purchases).
--
-- The existing `users` table already stores the ADMIN row;
-- this table stores the tenant-level hospital metadata.
-- =========================================================

CREATE TABLE IF NOT EXISTS hospitals (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    name              VARCHAR(150) NOT NULL,
    city              VARCHAR(100),
    address           VARCHAR(255),
    phone             VARCHAR(20),
    admin_user_id     BIGINT,
    plan              VARCHAR(30) NOT NULL DEFAULT 'trial',
    trial             TINYINT(1) NOT NULL DEFAULT 1,
    trial_expires_at  DATETIME NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hospital_admin_user FOREIGN KEY (admin_user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_hospital_plan (plan),
    INDEX idx_hospital_trial (trial, trial_expires_at)
) ENGINE=InnoDB;
