-- DeepSI Database Schema

-- Drop database if exists (use carefully in production)
DROP DATABASE IF EXISTS deepsi_db;

-- Create database
CREATE DATABASE deepsi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE deepsi_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    thumbnail VARCHAR(255),
    author_id INT NOT NULL,
    category_id INT NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- User liked articles
CREATE TABLE user_article_likes (
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(255),
    instructor_id INT NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    total_duration INT DEFAULT 0, -- Duration in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Course sections
CREATE TABLE course_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    duration INT DEFAULT 0, -- Duration in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Course lectures
CREATE TABLE course_lectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255),
    duration INT DEFAULT 0, -- Duration in minutes
    position INT NOT NULL,
    resources TEXT, -- JSON formatted resources
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);

-- User enrolled courses
CREATE TABLE user_courses (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress INT DEFAULT 0, -- Progress percentage
    last_lecture_id INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (last_lecture_id) REFERENCES course_lectures(id) ON DELETE SET NULL
);

-- Comments (for both articles and lectures)
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    article_id INT,
    lecture_id INT,
    parent_id INT, -- For nested comments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (lecture_id) REFERENCES course_lectures(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    CHECK (article_id IS NOT NULL OR lecture_id IS NOT NULL) -- Comment must be on article or lecture
);

-- Donations
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    user_id INT, -- NULL if anonymous
    email VARCHAR(100),
    name VARCHAR(100),
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Programming', 'Programming languages, software development, and coding tutorials'),
('Language', 'Natural language learning and linguistics'),
('Software', 'Software tools, applications, and utilities');

-- Insert sample users
INSERT INTO users (username, email, password, full_name) VALUES
('admin', 'admin@deepsi.com', '$2b$10$X7uM7sMnfq6EZrVD9Qxq8eDOPzA.2NoR0E0KYoQvtlQRjgR4xvBDW', 'Admin User'), -- password: admin123
('sachin', 'sachin@deepsi.com', '$2b$10$X7uM7sMnfq6EZrVD9Qxq8eDOPzA.2NoR0E0KYoQvtlQRjgR4xvBDW', 'Sachin'), -- password: admin123
('user', 'user@example.com', '$2b$10$X7uM7sMnfq6EZrVD9Qxq8eDOPzA.2NoR0E0KYoQvtlQRjgR4xvBDW', 'Regular User'); -- password: admin123

-- Insert sample articles
INSERT INTO articles (title, content, thumbnail, author_id, category_id) VALUES
('Python list explained', 'An introductory guide to understanding and working with Python lists. Lists are one of the most versatile data structures in Python. They allow you to store multiple items in a single variable.\n\nA list is created by placing elements inside square brackets [], separated by commas. Lists are ordered, changeable, and allow duplicate values. Lists are indexed, the first item has index [0], the second item has index [1], etc.', 'python_list.jpg', 2, 1),
('Why Python is Loved by Developers Worldwide', 'Python has become one of the most popular programming languages due to its simplicity, readability, and versatility. It\'s often the first choice for beginners, yet powerful enough for professionals building complex systems.\n\nOne of Python\'s biggest strengths is its clean and intuitive syntax, which closely resembles human language.', 'python_popular.jpg', 2, 1),
('Getting Started with Artificial Intelligence', 'An introductory guide to understanding and working with artificial intelligence in the near future. This article covers basic concepts, tools, and applications of AI in modern technology.', 'ai_intro.jpg', 2, 1);

-- Insert sample courses
INSERT INTO courses (title, description, thumbnail, instructor_id, category_id, total_duration) VALUES
('Learn Blender', 'A comprehensive course on Blender - the free and open source 3D creation suite. This course will take you from beginner to professional.', 'blender_course.jpg', 2, 3, 160);

-- Insert sample course sections
INSERT INTO course_sections (course_id, title, description, position, duration) VALUES
(1, 'Section 1: Starting', 'Getting started with Blender and understanding the interface', 1, 33),
(1, 'Section 2: Let\'s Make Something', 'Creating your first 3D models and scenes in Blender', 2, 41);

-- Insert sample course lectures
INSERT INTO course_lectures (section_id, title, description, video_url, duration, position, resources) VALUES
(1, 'Lecture 1: What is Blender', 'We gonna start with an brief description on what is blender and why do we even use it?', 'videos/blender_intro.mp4', 10, 1, '{\"slides\": \"slides/blender_intro.pdf\", \"source_files\": \"files/blender_intro.blend\"}'),
(1, 'Lecture 2: Why should we use Blender', 'Exploring the benefits and features of Blender compared to other 3D software', 'videos/why_blender.mp4', 8, 2, '{\"slides\": \"slides/why_blender.pdf\"}'),
(1, 'Lecture 3: Installation', 'How to download and install Blender on different operating systems', 'videos/blender_install.mp4', 5, 3, '{\"links\": [\"https://www.blender.org/download/\"]}'),
(1, 'Lecture 4: Shortcuts', 'Essential keyboard shortcuts to improve your workflow in Blender', 'videos/blender_shortcuts.mp4', 10, 4, '{\"cheatsheet\": \"files/blender_shortcuts.pdf\"}'),
(2, 'Lecture 5: What is Blender', 'Deep dive into Blender\'s capabilities and features', 'videos/blender_features.mp4', 10, 1, '{\"demo_files\": \"files/blender_demo.zip\"}'),
(2, 'Lecture 6: Why should we use Blender', 'Understanding Blender\'s role in the 3D industry', 'videos/blender_industry.mp4', 9, 2, '{\"case_studies\": \"files/blender_cases.pdf\"}'),
(2, 'Lecture 7: Installation', 'Advanced installation options and configurations', 'videos/blender_advanced_install.mp4', 5, 3, '{\"config_files\": \"files/blender_config.zip\"}'),
(2, 'Lecture 8: Shortcuts', 'Custom shortcut setups for different workflows', 'videos/blender_custom_shortcuts.mp4', 10, 4, '{\"preset_files\": \"files/shortcut_presets.zip\"}');

-- Insert sample donations
INSERT INTO donations (amount, user_id, email, name, message, is_anonymous) VALUES
(5.00, 3, 'mrcool@example.com', 'Mr Cool', 'Very Nice Job Keep it Up', FALSE),
(5.00, NULL, 'anonymous@example.com', 'Anonymous', 'Got My DSA Job, Thanks', TRUE),
(2.00, NULL, 'xeon@example.com', 'Xeon', 'Apricate The Effort', FALSE);