<?php
require_once __DIR__ . '/../config.php';

// بدء الجلسة إذا لم تكن قد بدأت
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * التحقق من تسجيل الدخول
 * 
 * @return bool
 */
function check_login_status() {
    return isset($_SESSION['user_id'], $_SESSION['logged_in']) && 
           $_SESSION['logged_in'] === true &&
           !empty($_SESSION['user_id']);
}

// التحقق من المصادقة بشكل صحيح
if (!check_login_status()) {
    $_SESSION['redirect_url'] = filter_var($_SERVER['REQUEST_URI'], FILTER_SANITIZE_URL);
    header("Location: ../login.php");
    exit();
}

// إعداد مهلة الجلسة (30 دقيقة)
$inactive = 1800; 

// التحقق من انتهاء الجلسة
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $inactive)) {
    session_unset();
    session_destroy();
    header("Location: ../login.php?timeout=1");
    exit();
}

// تحديث وقت النشاط
$_SESSION['last_activity'] = time();

// جلب معلومات المستخدم
try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        session_unset();
        session_destroy();
        header("Location: ../login.php");
        exit();
    }
    
    // جلب إحصائيات لوحة التحكم
    $stats = [
        'total_users' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
        'active_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE is_active = 1")->fetchColumn(),
        'recent_activities' => $pdo->query(
            "SELECT ua.*, u.username 
             FROM user_activities ua
             JOIN users u ON ua.user_id = u.id
             ORDER BY ua.created_at DESC 
             LIMIT 5"
        )->fetchAll(PDO::FETCH_ASSOC)
    ];
    
} catch (PDOException $e) {
    error_log("[" . date('Y-m-d H:i:s') . "] Dashboard error: " . $e->getMessage() . "\n", 3, __DIR__ . '/../logs/error.log');
    $stats = [];
    $_SESSION['error_message'] = "حدث خطأ في جلب بيانات لوحة التحكم";
}

// تحميل واجهة المستخدم بشكل آمن
$uiTheme = isset($_SESSION['admin_ui_theme']) ? $_SESSION['admin_ui_theme'] : 
           (defined('UI_THEME') ? UI_THEME : 'adminlte');

$basePath = realpath(__DIR__ . '/../assets/src/ui');
$themePath = $basePath . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $uiTheme) . '/admin/dashboard.php';
$defaultPath = $basePath . '/adminlte/admin/dashboard.php';

if (file_exists($themePath) && strpos(realpath($themePath), $basePath) === 0) {
    include $themePath;
} else {
    include $defaultPath;
}