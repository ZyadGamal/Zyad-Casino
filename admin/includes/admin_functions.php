<?php
// تحديث إعدادات البيئة بشكل آمن
function updateEnvSettings(array $settings): bool {
    $envPath = __DIR__ . '/../config/env.php';
    
    if (!file_exists($envPath) || !is_writable($envPath)) {
        throw new Exception("Env file not accessible");
    }

    $envContent = file_get_contents($envPath);
    if ($envContent === false) {
        throw new Exception("Failed to read env file");
    }

    foreach ($settings as $key => $value) {
        $value = addslashes($value); // منع ثغرات الحقن
        $pattern = "/define\('{$key}',\s*'.*?'\);/";
        $replacement = "define('{$key}', '{$value}');";
        $envContent = preg_replace($pattern, $replacement, $envContent);
    }

    return file_put_contents($envPath, $envContent) !== false;
}

// الحصول على قائمة الثيمات المتاحة
function getUiThemes(): array {
    return [
        'adminlte' => 'AdminLTE 3',
        'tabler' => 'Tabler IO',
        'coreui' => 'CoreUI 4',
        'bootstrap' => 'Bootstrap 5'
    ];
}

// تحميل أصول الواجهة مع التحقق من وجودها
function loadUiAssets(string $theme): array {
    $themes = getUiThemes();
    if (!array_key_exists($theme, $themes)) {
        $theme = 'adminlte';
    }

    $assetsDir = '/assets/compiled/'; // تصحيح خطأ إملائي (compiled بدلاً من compiled)
    $assets = [
        'css' => [],
        'js' => []
    ];

    // إضافة ملفات CSS
    $assets['css'][] = $assetsDir . "css/{$theme}.min.css";
    if ($_SESSION['admin_ui_direction'] ?? 'rtl' === 'rtl') {
        $rtlCss = $assetsDir . "css/{$theme}-rtl.min.css";
        if (file_exists($_SERVER['DOCUMENT_ROOT'] . $rtlCss)) {
            $assets['css'][] = $rtlCss;
        }
    }

    // إضافة ملفات JS
    $assets['js'][] = $assetsDir . "js/{$theme}.min.js";

    return $assets;
}

// دالة مساعدة لعرض واجهة المدير
function renderAdminDashboard(string $title, string $content): string {
    $uiConfig = loadAdminUI();
    ob_start();
    ?>
    <!DOCTYPE html>
    <html lang="ar" dir="<?= htmlspecialchars($uiConfig['direction']) ?>">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?= htmlspecialchars($title) ?></title>
        <?php foreach ($uiConfig['assets']['css'] as $css): ?>
            <link rel="stylesheet" href="<?= htmlspecialchars($css) ?>">
        <?php endforeach; ?>
    </head>
    <body class="hold-transition sidebar-mini">
        <div class="wrapper">
            <?php include __DIR__ . '/admin_navbar.php'; ?>
            <?php include __DIR__ . '/admin_sidebar.php'; ?>
            
            <div class="content-wrapper">
                <section class="content">
                    <div class="container-fluid">
                        <?= $content ?>
                    </div>
                </section>
            </div>
            
            <?php include __DIR__ . '/admin_footer.php'; ?>
        </div>
        
        <?php foreach ($uiConfig['assets']['js'] as $js): ?>
            <script src="<?= htmlspecialchars($js) ?>"></script>
        <?php endforeach; ?>
    </body>
    </html>
    <?php
    return ob_get_clean();
}