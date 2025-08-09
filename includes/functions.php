<?php
// تنقية المدخلات
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// التحقق من الجلسة
function verify_session() {
    if (!isset($_SESSION['user_id'], $_SESSION['ip_address'], $_SESSION['user_agent'])) {
        return false;
    }
    
    if ($_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
        return false;
    }
    
    if ($_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
        return false;
    }
    
    return true;
}

// تسجيل الأخطاء
function log_error($message) {
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message" . PHP_EOL;
    file_put_contents(LOG_PATH, $log_message, FILE_APPEND);
}

// التحقق من الصلاحيات
function check_permission($required_role) {
    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== $required_role) {
        header('HTTP/1.0 403 Forbidden');
        exit('Access Denied');
    }
}

// إنشاء CSRF Token
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// التحقق من CSRF Token
function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
?>