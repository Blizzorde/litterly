-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2026 at 04:32 AM
-- Server version: 8.0.45
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `litterly`
--
CREATE DATABASE IF NOT EXISTS `litterly` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `litterly`;


-- --------------------------------------------------------

--
-- Table structure for table `item_type`
--

CREATE TABLE IF NOT EXISTS `item_type` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_type_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `item_type`
--

INSERT INTO `item_type` (`id`, `item_type_name`) VALUES
(1, 'badge'),
(2, 'avatar'),
(3, 'title'),
(4, 'frame');

-- --------------------------------------------------------

--
-- Table structure for table `missions`
--

CREATE TABLE IF NOT EXISTS `missions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(120) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `status` enum('draft','open','ongoing','awaiting_rewards','completed','cancelled') DEFAULT 'open',
  `max_participants` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `photo_url` text,
  PRIMARY KEY (`id`),
  KEY `missions_created_by_foreign` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mission_areas`
--

CREATE TABLE IF NOT EXISTS `mission_areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mission_id` int NOT NULL,
  `area_name` varchar(120) NOT NULL,
  `area_description` text,
  `reward_points` int NOT NULL DEFAULT '10',
  `max_users` int DEFAULT '1',
  `photo_url` text,
  PRIMARY KEY (`id`),
  KEY `mission_areas_mission_id_foreign` (`mission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mission_area_assignments`
--

CREATE TABLE IF NOT EXISTS `mission_area_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `area_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `mission_area_assignments_area_id_foreign` (`area_id`),
  KEY `mission_area_assignments_registration_id_foreign` (`registration_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mission_registrations`
--

CREATE TABLE IF NOT EXISTS `mission_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mission_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('registered','attended','absent','rewarded','cancelled') DEFAULT 'registered',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mission_registrations_mission_id_user_id_unique` (`mission_id`,`user_id`),
  KEY `mission_registrations_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `point_transactions`
--

CREATE TABLE IF NOT EXISTS `point_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mission_id` int DEFAULT NULL,
  `shop_order_id` int DEFAULT NULL,
  `type` enum('earned','spent','manual_adjustment') NOT NULL,
  `points` int NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `point_transactions_mission_id_index` (`mission_id`),
  KEY `point_transactions_user_id_foreign` (`user_id`),
  KEY `point_transactions_shop_order_id_foreign` (`shop_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) NOT NULL,
  `role_description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `role_description`) VALUES
(1, 'admin', 'Administrator'),
(2, 'user', 'Default User in Litterly');

-- --------------------------------------------------------

--
-- Table structure for table `shop_items`
--

CREATE TABLE IF NOT EXISTS `shop_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `description` text,
  `item_type_id` int UNSIGNED NOT NULL,
  `price_points` int NOT NULL,
  `stackable` tinyint(1) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_items_item_type_id_foreign` (`item_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shop_items`
--

INSERT INTO `shop_items` (`id`, `name`, `description`, `item_type_id`, `price_points`, `stackable`, `active`, `created_at`) VALUES
(1, 'Early Adopter', 'Awarded to the first wave of Litterly members', 1, 500, 0, 1, '2026-05-24 18:52:01'),
(2, 'Clean Streak', 'Completed 5 missions in a row', 1, 750, 0, 1, '2026-05-24 18:52:01'),
(3, 'Ocean Guardian', 'Participated in a beach cleanup mission', 1, 1000, 0, 1, '2026-05-24 18:52:01'),
(4, 'Tree Hugger', 'Planted 10 or more trees', 1, 1000, 0, 1, '2026-05-24 18:52:01'),
(5, 'Green Hero', 'A green caped eco warrior avatar', 2, 800, 0, 1, '2026-05-24 18:52:01'),
(6, 'Nature Spirit', 'A mystical forest spirit avatar', 2, 1200, 0, 1, '2026-05-24 18:52:01'),
(7, 'Ocean Diver', 'A deep sea diver avatar', 2, 1200, 0, 1, '2026-05-24 18:52:01'),
(8, 'Eco Warrior', 'Show the world you mean business', 3, 300, 0, 1, '2026-05-24 18:52:01'),
(9, 'Planet Protector', 'For the truly dedicated', 3, 600, 0, 1, '2026-05-24 18:52:01'),
(10, 'Litter Legend', 'Reserved for the elite cleaners', 3, 1500, 0, 1, '2026-05-24 18:52:01'),
(11, 'Leaf Frame', 'A subtle green leaf border', 4, 400, 0, 1, '2026-05-24 18:52:01'),
(12, 'Ocean Frame', 'A cool blue wave border', 4, 400, 0, 1, '2026-05-24 18:52:01'),
(13, 'Fire Frame', 'A bold flame border for top contributors', 4, 900, 0, 1, '2026-05-24 18:52:01');

-- --------------------------------------------------------

--
-- Table structure for table `shop_orders`
--

CREATE TABLE IF NOT EXISTS `shop_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total_points` int NOT NULL,
  `purchased_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_orders_item_id_foreign` (`item_id`),
  KEY `shop_orders_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` text NOT NULL,
  `role_id` int UNSIGNED NOT NULL DEFAULT '2',
  `points` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_foreign` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `points`, `created_at`) VALUES
(15, 'Admin', 'admin@litterly.sr', '$2b$10$LgKlbC/PxvyaqPVGDZFkROKth.FMvUCoGJuWI.vIvFpB1akq3.dw.', 1, 0, '2026-05-26 02:30:04');

-- --------------------------------------------------------

--
-- Table structure for table `user_inventory`
--

CREATE TABLE IF NOT EXISTS `user_inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `acquired_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_inventory_user_id_item_id_unique` (`user_id`,`item_id`),
  KEY `user_inventory_item_id_foreign` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `missions`
--
ALTER TABLE `missions`
  ADD CONSTRAINT `missions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `mission_areas`
--
ALTER TABLE `mission_areas`
  ADD CONSTRAINT `mission_areas_mission_id_foreign` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`);

--
-- Constraints for table `mission_area_assignments`
--
ALTER TABLE `mission_area_assignments`
  ADD CONSTRAINT `mission_area_assignments_area_id_foreign` FOREIGN KEY (`area_id`) REFERENCES `mission_areas` (`id`),
  ADD CONSTRAINT `mission_area_assignments_registration_id_foreign` FOREIGN KEY (`registration_id`) REFERENCES `mission_registrations` (`id`);

--
-- Constraints for table `mission_registrations`
--
ALTER TABLE `mission_registrations`
  ADD CONSTRAINT `mission_registrations_mission_id_foreign` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`),
  ADD CONSTRAINT `mission_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `point_transactions`
--
ALTER TABLE `point_transactions`
  ADD CONSTRAINT `point_transactions_mission_id_foreign` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`),
  ADD CONSTRAINT `point_transactions_shop_order_id_foreign` FOREIGN KEY (`shop_order_id`) REFERENCES `shop_orders` (`id`),
  ADD CONSTRAINT `point_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `shop_items`
--
ALTER TABLE `shop_items`
  ADD CONSTRAINT `shop_items_item_type_id_foreign` FOREIGN KEY (`item_type_id`) REFERENCES `item_type` (`id`);

--
-- Constraints for table `shop_orders`
--
ALTER TABLE `shop_orders`
  ADD CONSTRAINT `shop_orders_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`),
  ADD CONSTRAINT `shop_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_inventory`
--
ALTER TABLE `user_inventory`
  ADD CONSTRAINT `user_inventory_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`),
  ADD CONSTRAINT `user_inventory_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
