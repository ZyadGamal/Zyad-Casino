<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/session_manager.php';
require_once __DIR__ . '/admin_functions.php';

// التحقق من صلاحيات المدير بشكل آمن
function verifyAdminAccess() {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI'];
        header("Location: /public/login.php?error=unauthorized");
        exit;
    }
}

// تحميل إعدادات الواجهة مع قيم افتراضية آمنة
function loadAdminUI() {
    $uiTheme = $_SESSION['admin_ui_theme'] ?? (defined('UI_THEME') ? UI_THEME : 'adminlte');
    $uiDirection = $_SESSION['admin_ui_direction'] ?? (defined('UI_DIRECTION') ? UI_DIRECTION : 'rtl');
    
    // تحميل الأصول مع التحقق من وجودها
    try {
        $uiAssets = loadUiAssets($uiTheme);
        return [
            'theme' => $uiTheme,
            'direction' => $uiDirection,
            'assets' => $uiAssets
        ];
    } catch (Exception $e) {
        error_log("Failed to load UI assets: " . $e->getMessage());
        return [
            'theme' => 'adminlte',
            'direction' => 'rtl',
            'assets' => loadUiAssets('adminlte')
        ];
    }
}

// تنفيذ الوظائف
verifyAdminAccess();
$uiConfig = loadAdminUI();