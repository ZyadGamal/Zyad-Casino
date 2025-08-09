<?php
require 'config.php';
if (is_logged_in()) {
    redirect('admin/dashboard.php');
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/auth.css">
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <i class="fas fa-lock fa-3x"></i>
            <h1>تسجيل الدخول</h1>
        </div>
        
        <form id="loginForm" method="POST">
            <div class="input-group">
                <label for="username"><i class="fas fa-user"></i> اسم المستخدم أو البريد الإلكتروني</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="input-group">
                <label for="password"><i class="fas fa-key"></i> كلمة المرور</label>
                <input type="password" id="password" name="password" required>
                <span class="toggle-password" onclick="togglePassword()">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
            
            <div class="g-recaptcha" data-sitekey="<?php echo RECAPTCHA_SITE_KEY; ?>"></div>
            
            <button type="submit" name="login">
                <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
            </button>
            
            <div class="login-footer">
                <a href="forgot-password.php"><i class="fas fa-question-circle"></i> نسيت كلمة المرور؟</a>
                <p>ليس لديك حساب؟ <a href="register.php"><i class="fas fa-user-plus"></i> أنشئ حساباً جديداً</a></p>
            </div>
        </form>
        
        <div id="loginMessage" class="message-box"></div>
    </div>

    <script src="assets/js/auth.js"></script>
</body>
</html>