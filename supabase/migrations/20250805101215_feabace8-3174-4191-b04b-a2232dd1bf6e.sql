-- First migration: Add the enum value
ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'social_media';