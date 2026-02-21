-- Add per-user active Kanban pipeline preference
ALTER TABLE "public"."usuarios"
ADD COLUMN "kanbanPipelineAtivo" TEXT NOT NULL DEFAULT 'principal';
