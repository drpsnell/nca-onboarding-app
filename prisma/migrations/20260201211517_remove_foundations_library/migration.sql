-- Remove Foundations Library: drop Reading table and clean up FOUNDATIONS module rows

-- Delete readings (foreign key RESTRICT requires deleting children first)
DELETE FROM "Reading" WHERE "moduleId" IN (SELECT "id" FROM "Module" WHERE "category" = 'FOUNDATIONS');

-- Delete any progress records for Foundations modules
DELETE FROM "ModuleProgress" WHERE "moduleId" IN (SELECT "id" FROM "Module" WHERE "category" = 'FOUNDATIONS');

-- Delete the Foundations module itself
DELETE FROM "Module" WHERE "category" = 'FOUNDATIONS';

-- DropIndex
DROP INDEX IF EXISTS "Reading_moduleId_idx";

-- DropTable
DROP TABLE "Reading";
