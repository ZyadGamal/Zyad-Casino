<?php
require 'config.php';

// التحقق من الجلسة في كل طلب
if (!verify_session()) {
    session_unset();
    session_destroy();
    header('Location: /index.php?error=session_expired');
    exit();
}

// التحقق من آخر نشاط (30 دقيقة كحد أقصى)
$inactive = 1800; // 30 دقيقة بالثواني
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $inactive)) {
    session_unset();
    session_destroy();
    header('Location: /index.php?error=session_timeout');
    exit();
}

// تحديث وقت النشاط
$_SESSION['last_activity'] = time();

// التحقق من CSRF Token للطلبات POST/PUT/DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!verify_csrf_token($token)) {
        header('HTTP/1.0 403 Forbidden');
        exit('Invalid CSRF Token');
    }
}
?>