/*
  Warnings:

  - Changed the type of `bestTime` on the `Attraction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Attraction" DROP COLUMN "bestTime",
ADD COLUMN     "bestTime" TEXT NOT NULL;
