<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/admin_functions.php';

$pageTitle = "إعدادات النظام";
$activeNav = "settings";

// تحقق من الصلاحيات الإدارية بشكل صحيح
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    $_SESSION['error_message'] = "ليس لديك صلاحية الوصول إلى هذه الصفحة";
    header("Location: dashboard.php");
    exit();
}

// معالجة تحديث الإعدادات
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // التحقق من البيانات المدخلة
        $allowedThemes = ['adminlte', 'tabler', 'coreui'];
        $allowedDirections = ['rtl', 'ltr'];
        
        $theme = isset($_POST['ui_theme']) && in_array($_POST['ui_theme'], $allowedThemes) 
            ? $_POST['ui_theme'] 
            : 'adminlte';
            
        $direction = isset($_POST['ui_direction']) && in_array($_POST['ui_direction'], $allowedDirections)
            ? $_POST['ui_direction']
            : 'rtl';
        
        // تحديث ملف env.php
        $success = updateEnvSettings([
            'UI_THEME' => $theme,
            'UI_DIRECTION' => $direction
        ]);
        
        if ($success) {
            $_SESSION['admin_ui_theme'] = $theme;
            $_SESSION['admin_ui_direction'] = $direction;
            $_SESSION['success_message'] = "تم تحديث الإعدادات بنجاح";
        } else {
            $_SESSION['error_message'] = "حدث خطأ أثناء تحديث الإعدادات";
        }
    } catch (Exception $e) {
        $_SESSION['error_message'] = "حدث خطأ: " . htmlspecialchars($e->getMessage());
        error_log("[" . date('Y-m-d H:i:s') . "] Settings update error: " . $e->getMessage() . "\n", 3, __DIR__ . '/../logs/error.log');
    }
    
    header("Location: settings.php");
    exit();
}

// تحميل الإعدادات الحالية بشكل آمن
$currentTheme = isset($_SESSION['admin_ui_theme']) 
    ? $_SESSION['admin_ui_theme']
    : (defined('UI_THEME') ? UI_THEME : 'adminlte');
    
$currentDirection = isset($_SESSION['admin_ui_direction'])
    ? $_SESSION['admin_ui_direction']
    : (defined('UI_DIRECTION') ? UI_DIRECTION : 'rtl');

// تحميل واجهة المستخدم المحددة مع التحقق من الأمان
$basePath = realpath(__DIR__ . '/../assets/src/ui');
$themePath = $basePath . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $currentTheme) . '/admin/settings.php';
$defaultPath = $basePath . '/adminlte/admin/settings.php';

if (file_exists($themePath) && strpos(realpath($themePath), $basePath) === 0) {
    include $themePath;
} else {
    include $defaultPath;
}