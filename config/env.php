<?php
// إعدادات البيئة الأساسية
define('APP_NAME', 'Zyad Casino');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'production'); // يمكن أن تكون development, staging, production
define('APP_DEBUG', false);

// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'zyad_casino');
define('DB_USER', 'root');  // اسم مستخدم MySQL
define('DB_PASS', 'zyadzz');      // كلمة مرور MySQL

// إعدادات واجهة المستخدم
define('UI_THEME', 'adminlte'); // adminlte, tabler, coreui
define('UI_DIRECTION', 'rtl');
define('UI_LANG', 'ar');

// إعدادات الأمان
define('CSRF_PROTECTION', true);
define('XSS_PROTECTION', true);