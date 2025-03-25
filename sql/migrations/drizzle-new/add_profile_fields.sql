-- Add new profile fields to users_table
ALTER TABLE "users_table" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "users_table" ADD COLUMN IF NOT EXISTS "birthday" date;
ALTER TABLE "users_table" ADD COLUMN IF NOT EXISTS "location" text; 