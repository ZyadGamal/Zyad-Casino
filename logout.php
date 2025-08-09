<?php
// ملف تسجيل الخروج - logout.php
require 'config.php';

// تدمير جميع بيانات الجلسة
$_SESSION = array();

// حذف كوكيز الجلسة
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// تدمير الجلسة
session_destroy();

// التوجيه إلى صفحة تسجيل الدخول
header("Location: index.php");
exit();
?>