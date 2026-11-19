-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: jobify
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `application_answers`
--

DROP TABLE IF EXISTS `application_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_answers` (
  `answer_id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`),
  UNIQUE KEY `unique_application_question` (`application_id`,`question_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `application_answers_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE,
  CONSTRAINT `application_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `job_application_questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `application_details`
--

DROP TABLE IF EXISTS `application_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `professional_summary` text,
  `skills` json DEFAULT NULL,
  `experience_level` varchar(50) DEFAULT NULL,
  `years_of_experience` decimal(4,1) DEFAULT NULL,
  `current_company` varchar(150) DEFAULT NULL,
  `current_job_title` varchar(150) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `github_url` varchar(500) DEFAULT NULL,
  `portfolio_url` varchar(500) DEFAULT NULL,
  `cover_letter` text,
  `current_ctc` varchar(100) DEFAULT NULL,
  `expected_ctc` varchar(100) DEFAULT NULL,
  `resume_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`detail_id`),
  UNIQUE KEY `application_id` (`application_id`),
  CONSTRAINT `application_details_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `job_id` int NOT NULL,
  `application_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Reviewed','Shortlisted','Rejected','Withdrawn','Hired') DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `user_id` (`user_id`,`job_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `candidate_profiles`
--

DROP TABLE IF EXISTS `candidate_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_profiles` (
  `profile_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `professional_summary` text,
  `skills` json DEFAULT NULL,
  `experience_level` varchar(50) DEFAULT NULL,
  `years_of_experience` decimal(4,1) DEFAULT NULL,
  `current_company` varchar(150) DEFAULT NULL,
  `current_job_title` varchar(150) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `github_url` varchar(500) DEFAULT NULL,
  `portfolio_url` varchar(500) DEFAULT NULL,
  `resume_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `candidate_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `interview_id` int NOT NULL AUTO_INCREMENT,
  `application_id` int DEFAULT NULL,
  `candidate_user_id` int DEFAULT NULL,
  `recruiter_id` int NOT NULL,
  `candidate_name` varchar(150) NOT NULL,
  `candidate_email` varchar(150) NOT NULL,
  `job_title` varchar(150) NOT NULL,
  `interview_date` date NOT NULL,
  `interview_time` time NOT NULL,
  `interview_type` enum('Online','In-person','Phone') NOT NULL,
  `meeting_link` varchar(500) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interviewer` varchar(150) DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`interview_id`),
  KEY `fk_interview_application` (`application_id`),
  KEY `fk_interview_candidate` (`candidate_user_id`),
  KEY `fk_interview_recruiter` (`recruiter_id`),
  CONSTRAINT `fk_interview_application` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_interview_candidate` FOREIGN KEY (`candidate_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_interview_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_application_questions`
--

DROP TABLE IF EXISTS `job_application_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_application_questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` varchar(50) NOT NULL,
  `options` json DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`question_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_application_questions_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_responsibilities`
--

DROP TABLE IF EXISTS `job_responsibilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_responsibilities` (
  `responsibility_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `responsibility` text NOT NULL,
  PRIMARY KEY (`responsibility_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_responsibilities_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_skills`
--

DROP TABLE IF EXISTS `job_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_skills` (
  `skill_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `skill` varchar(100) NOT NULL,
  PRIMARY KEY (`skill_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_skills_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_tags`
--

DROP TABLE IF EXISTS `job_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `tag` varchar(100) NOT NULL,
  PRIMARY KEY (`tag_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_tags_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `job_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `company` varchar(150) NOT NULL,
  `location` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `recruiter_id` int DEFAULT NULL,
  `workplace_type` enum('On-site','Remote','Hybrid') DEFAULT NULL,
  `employment_type` enum('Full-time','Part-time','Internship','Contract','Freelance') DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  `responsibilities` text,
  `deadline` date DEFAULT NULL,
  `status` enum('Draft','Active','Closed') DEFAULT 'Active',
  PRIMARY KEY (`job_id`),
  KEY `fk_jobs_recruiter` (`recruiter_id`),
  CONSTRAINT `fk_jobs_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `interview_id` int DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('interview_scheduled','interview_rescheduled','interview_cancelled') NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `fk_notification_user` (`user_id`),
  KEY `fk_notification_interview` (`interview_id`),
  CONSTRAINT `fk_notification_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`interview_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recruiter_profiles`
--

DROP TABLE IF EXISTS `recruiter_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruiter_profiles` (
  `recruiter_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(150) NOT NULL,
  `company_website` varchar(255) DEFAULT NULL,
  `designation` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `industry` varchar(100) DEFAULT NULL,
  `company_size` varchar(50) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `about` text,
  `linkedin` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `company_logo` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`recruiter_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `recruiter_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('job_seeker','recruiter') NOT NULL DEFAULT 'job_seeker',
  `account_status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 22:25:45
