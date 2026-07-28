-- Rename 'doing' to 'in_progress' in statuses enum
ALTER TYPE "statuses" RENAME VALUE 'doing' TO 'in_progress';
