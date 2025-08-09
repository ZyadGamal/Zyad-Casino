<?php
require_once __DIR__ . '/../includes/session_manager.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/includes/admin_auth.php';
echo renderAdminDashboard('لوحة التحكم', '<h1>مرحباً بك في لوحة التحكم</h1>');

// إذا كان المستخدم مسجل الدخول، إعادة توجيهه إلى لوحة التحكم
if (isset($_SESSION['user'])) {
    if ($_SESSION['user']['role'] === 'admin') {
        header("Location: /admin/dashboard.php");
    } else {
        header("Location: /user/dashboard.php");
    }
    exit;
}

// تحميل واجهة المستخدم للصفحة الرئيسية
$uiTheme = defined('UI_THEME') ? UI_THEME : 'adminlte';
$uiPath = __DIR__ . "/../assets/src/ui/{$uiTheme}/public/index.php";

if (file_exists($uiPath)) {
    include $uiPath;
} else {
    include __DIR__ . "/../assets/src/ui/adminlte/public/index.php";
}