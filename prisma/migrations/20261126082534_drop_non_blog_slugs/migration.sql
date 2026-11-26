/*
  Warnings:

  - You are about to drop the column `slug` on the `certificate` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skill_group` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skill_item` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `social_link` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `certificate_slug_key` ON `certificate`;

-- DropIndex
DROP INDEX `project_slug_key` ON `project`;

-- DropIndex
DROP INDEX `skill_group_slug_key` ON `skill_group`;

-- DropIndex
DROP INDEX `skill_item_slug_key` ON `skill_item`;

-- DropIndex
DROP INDEX `social_link_slug_key` ON `social_link`;

-- AlterTable
ALTER TABLE `certificate` DROP COLUMN `slug`;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `slug`;

-- AlterTable
ALTER TABLE `skill_group` DROP COLUMN `slug`;

-- AlterTable
ALTER TABLE `skill_item` DROP COLUMN `slug`;

-- AlterTable
ALTER TABLE `social_link` DROP COLUMN `slug`;
