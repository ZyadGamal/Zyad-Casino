<?php
require_once __DIR__ . '/config/database.php';

$db = Database::getInstance();

$tables = [
    "CREATE TABLE IF NOT EXISTS `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `username` varchar(50) NOT NULL,
        `password` varchar(255) NOT NULL,
        `email` varchar(100) NOT NULL,
        `role` enum('admin','user') NOT NULL DEFAULT 'user',
        `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`id`),
        UNIQUE KEY `username` (`username`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    
    // ... (أوامر إنشاء الجداول الأخرى)
];

foreach ($tables as $query) {
    $db->exec($query);
}

echo "تم إنشاء الجداول بنجاح!";