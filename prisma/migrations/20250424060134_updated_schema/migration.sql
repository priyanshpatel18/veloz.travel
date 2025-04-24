/*
  Warnings:

  - Added the required column `state` to the `Attraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "state" TEXT NOT NULL;
