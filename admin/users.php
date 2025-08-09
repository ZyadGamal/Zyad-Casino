<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/admin_functions.php';

$pageTitle = "إدارة المستخدمين";
$activeNav = "users";

// تحقق من الصلاحيات الإدارية
if (!is_admin()) {
    $_SESSION['error_message'] = "ليس لديك صلاحية الوصول إلى هذه الصفحة";
    header("Location: dashboard.php");
    exit;
}

try {
    // جلب بيانات المستخدمين مع pagination
    $db = Database::getInstance();
    $page = $_GET['page'] ?? 1;
    $limit = 20;
    $offset = ($page - 1) * $limit;
    
    // جلب العدد الكلي للمستخدمين
    $totalUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    
    // جلب المستخدمين للصفحة الحالية
    $stmt = $db->prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    // حساب عدد الصفحات
    $totalPages = ceil($totalUsers / $limit);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $_SESSION['error_message'] = "حدث خطأ في جلب بيانات المستخدمين";
    $users = [];
    $totalPages = 1;
}

// تحميل واجهة المستخدم المحددة
$uiTheme = $_SESSION['admin_ui_theme'] ?? (defined('UI_THEME') ? UI_THEME : 'adminlte');
$uiPath = __DIR__ . "/../assets/src/ui/{$uiTheme}/admin/users.php";
if (!file_exists($uiPath)) {
    $uiPath = __DIR__ . "/../assets/src/ui/adminlte/admin/users.php";
}

include $uiPath;