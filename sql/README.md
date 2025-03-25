# SQL Directory Organization

This directory contains SQL files organized into the following categories:

## Directory Structure

- `/database`: Database schema definitions and migrations
  - Main schema definitions
  - Table structures
  - View definitions

- `/migrations`: SQL migration scripts
  - Manual migrations
  - Version-specific changes
  - `/drizzle`: Drizzle ORM migration files (auto-generated)

- `/leaderboard`: Leaderboard-related SQL files
  - Leaderboard table structure
  - Triggers and functions
  - Fixes and optimizations

- `/user`: User-related SQL files
  - User table modifications
  - User data operations
  - Authentication-related queries

- `/fixes`: SQL fixes and one-time migrations
  - Type migrations
  - Column fixes
  - Schema corrections

- `/utils`: Utility SQL scripts
  - Database checks
  - Diagnostics
  - Maintenance scripts

- `/scripts`: Miscellaneous scripts
  - One-off operations
  - Data imports/exports
  - Special case handling

## Usage Notes

- Files are organized by their primary purpose
- When adding new SQL files, please place them in the appropriate category
- For significant schema changes, add a migration script in the `/migrations` directory
- Drizzle migrations are automatically generated and should not be modified directly
