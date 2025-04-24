/*
  Warnings:

  - Added the required column `bestTime` to the `Attraction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BestTime" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "bestTime" "BestTime" NOT NULL;
