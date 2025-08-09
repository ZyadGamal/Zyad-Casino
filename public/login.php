<?php
require_once __DIR__ . '/../includes/session_manager.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/../includes/auth.php';
    
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (authenticateUser($username, $password)) {
        $redirect = $_GET['redirect'] ?? ($_SESSION['user']['role'] === 'admin' ? '/admin/dashboard.php' : '/user/dashboard.php');
        header("Location: $redirect");
        exit;
    } else {
        $_SESSION['error_message'] = "اسم المستخدم أو كلمة المرور غير صحيحة";
    }
}

// تحميل واجهة المستخدم لصفحة تسجيل الدخول
$uiTheme = defined('UI_THEME') ? UI_THEME : 'adminlte';
$uiPath = __DIR__ . "/../assets/src/ui/{$uiTheme}/public/login.php";

if (file_exists($uiPath)) {
    include $uiPath;
} else {
    include __DIR__ . "/../assets/src/ui/adminlte/public/login.php";
}