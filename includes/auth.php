<?php
require 'config.php';

// معالجة تسجيل الدخول
if (isset($_POST['login'])) {
    $username = sanitize($_POST['username']);
    $password = sanitize($_POST['password']);
    $captcha = $_POST['g-recaptcha-response'] ?? '';

    // التحقق من CAPTCHA
    if (!verify_captcha($captcha)) {
        echo json_encode(['status' => 'error', 'message' => 'التحقق من reCAPTCHA غير صالح']);
        exit();
    }

    // التحقق من محاولات تسجيل الدخول
    if (check_login_attempts($_SERVER['REMOTE_ADDR'], $username)) {
        echo json_encode(['status' => 'error', 'message' => 'تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة لاحقاً']);
        exit();
    }

    // البحث عن المستخدم
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // تسجيل الدخول ناجح
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['username'] = $user['username'];
        
        // إعادة تعيين محاولات تسجيل الدخول
        reset_login_attempts($_SERVER['REMOTE_ADDR'], $username);
        
        echo json_encode(['status' => 'success', 'redirect' => 'admin/dashboard.php']);
    } else {
        // تسجيل محاولة فاشلة
        record_login_attempt($_SERVER['REMOTE_ADDR'], $username);
        
        echo json_encode(['status' => 'error', 'message' => 'بيانات الدخول غير صحيحة!']);
    }
    exit();
}

// دوال مساعدة للتحقق من CAPTCHA
function verify_captcha($captcha) {
    if (empty($captcha)) return false;
    
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => RECAPTCHA_SECRET_KEY,
        'response' => $captcha,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $result = json_decode($response);
    
    return $result->success;
}

// دوال إدارة محاولات تسجيل الدخول
function check_login_attempts($ip, $username) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM login_attempts 
                          WHERE ip_address = ? AND username = ? 
                          AND last_attempt > DATE_SUB(NOW(), INTERVAL 30 MINUTE)");
    $stmt->execute([$ip, $username]);
    $attempt = $stmt->fetch();
    
    return ($attempt && $attempt['attempts'] >= 5);
}

function record_login_attempt($ip, $username) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM login_attempts 
                          WHERE ip_address = ? AND username = ?");
    $stmt->execute([$ip, $username]);
    $attempt = $stmt->fetch();
    
    if ($attempt) {
        $stmt = $pdo->prepare("UPDATE login_attempts 
                              SET attempts = attempts + 1, last_attempt = NOW() 
                              WHERE id = ?");
        $stmt->execute([$attempt['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO login_attempts 
                              (ip_address, username, attempts) 
                              VALUES (?, ?, 1)");
        $stmt->execute([$ip, $username]);
    }
}

function reset_login_attempts($ip, $username) {
    global $pdo;
    
    $stmt = $pdo->prepare("DELETE FROM login_attempts 
                          WHERE ip_address = ? AND username = ?");
    $stmt->execute([$ip, $username]);
}
?>