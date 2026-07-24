-- ============================================================
-- Sports Injury Risk Detection from Video using AI
-- Milestone 1 — Database Schema (MySQL 8+)
-- ============================================================
-- Normalization: schema is in 3NF.
--   - Roles is separated from Users to avoid repeating role strings.
--   - Athlete-specific attributes are separated from Users into Athletes
--     so non-athlete users (coaches/admins) don't carry null athlete columns.
--   - Videos and Predictions are separated (1 video : many predictions,
--     so re-runs in later milestones don't require a schema change).
-- ============================================================

CREATE DATABASE IF NOT EXISTS sports_injury_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sports_injury_db;

-- ------------------------------------------------------------
-- Table: roles
-- ------------------------------------------------------------
CREATE TABLE roles (
    role_id     INT AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,   -- 'athlete', 'coach', 'admin'
    description VARCHAR(255) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id        INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role_id        INT NOT NULL,
    phone          VARCHAR(20) DEFAULT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    profile_image  VARCHAR(255) DEFAULT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);

-- ------------------------------------------------------------
-- Table: athletes  (1:1 extension of users where role = athlete)
-- ------------------------------------------------------------
CREATE TABLE athletes (
    athlete_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL UNIQUE,
    height_cm        DECIMAL(5,2) DEFAULT NULL,
    weight_kg        DECIMAL(5,2) DEFAULT NULL,
    age              INT DEFAULT NULL,
    gender           ENUM('male', 'female', 'other') DEFAULT NULL,
    sport             VARCHAR(100) DEFAULT NULL,
    experience_years  DECIMAL(4,1) DEFAULT NULL,
    medical_history   TEXT DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_athletes_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table: videos
-- ------------------------------------------------------------
CREATE TABLE videos (
    video_id       INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id     INT NOT NULL,
    file_name      VARCHAR(255) NOT NULL,
    file_path      VARCHAR(500) NOT NULL,
    file_size_mb   DECIMAL(8,2) DEFAULT NULL,
    duration_secs  INT DEFAULT NULL,
    sport_activity VARCHAR(100) DEFAULT NULL,
    upload_status  ENUM('uploaded', 'processing', 'processed', 'failed') NOT NULL DEFAULT 'uploaded',
    uploaded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_videos_athlete
        FOREIGN KEY (athlete_id) REFERENCES athletes(athlete_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_videos_athlete ON videos(athlete_id);

-- ------------------------------------------------------------
-- Table: predictions
-- (Milestone 1: table + relationships only, no AI logic yet)
-- ------------------------------------------------------------
CREATE TABLE predictions (
    prediction_id     INT AUTO_INCREMENT PRIMARY KEY,
    video_id          INT NOT NULL,
    athlete_id        INT NOT NULL,
    risk_level        ENUM('low', 'moderate', 'high') DEFAULT NULL,
    risk_score        DECIMAL(5,2) DEFAULT NULL,   -- 0.00 - 100.00
    body_part_flagged VARCHAR(100) DEFAULT NULL,
    model_version     VARCHAR(50) DEFAULT NULL,
    status            ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    notes             TEXT DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_predictions_video
        FOREIGN KEY (video_id) REFERENCES videos(video_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_predictions_athlete
        FOREIGN KEY (athlete_id) REFERENCES athletes(athlete_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_predictions_athlete ON predictions(athlete_id);
CREATE INDEX idx_predictions_status ON predictions(status);

-- ------------------------------------------------------------
-- Seed data: default roles
-- ------------------------------------------------------------
INSERT INTO roles (role_name, description) VALUES
    ('athlete', 'Uploads training videos and views personal risk predictions'),
    ('coach',   'Monitors athletes, reviews videos and risk history'),
    ('admin',   'Manages users, roles and platform configuration');
