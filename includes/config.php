<?php
// تعطيل عرض الأخطاء في بيئة الإنتاج
error_reporting(0);
ini_set('display_errors', 0);

// إعدادات الجلسة الآمنة
session_start([
    'name' => 'SecureSessionID',
    'cookie_lifetime' => 86400,
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);

// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_USER', 'secure_user');
define('DB_PASS', 'complex_password_123');
define('DB_NAME', 'secure_dashboard');
define('DB_CHARSET', 'utf8mb4');

// إعدادات reCAPTCHA
define('RECAPTCHA_SITE_KEY', 'your_actual_site_key');
define('RECAPTCHA_SECRET_KEY', 'your_actual_secret_key');

// إعدادات التطبيق
define('APP_ENV', 'production'); // يمكن أن تكون 'development' أو 'production'
define('LOG_PATH', __DIR__ . '/../logs/app.log');

try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
        DB_USER, 
        DB_PASS, 
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false
        ]
    );
} catch(PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    header("Location: /maintenance.html");
    exit();
}

// دوال مساعدة
require_once 'functions.php';
?>