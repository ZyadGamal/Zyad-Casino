<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> | <?= APP_NAME ?></title>
    
    <!-- أصول CoreUI مع RTL -->
    <link rel="stylesheet" href="/assets/compiled/css/coreui.min.css">
    <link rel="stylesheet" href="/assets/compiled/css/coreui-rtl.min.css">
</head>
<body>
<div class="c-app">
    <!-- القائمة الجانبية -->
    <?php include __DIR__ . '/coreui/partials/sidebar.php'; ?>
    
    <div class="c-wrapper">
        <!-- Header -->
        <?php include __DIR__ . '/coreui/partials/header.php'; ?>
        
        <!-- المحتوى الرئيسي -->
        <div class="c-body">
            <main class="c-main">
                <div class="container-fluid">
                    <div class="fade-in">
                        <h1><?= $pageTitle ?></h1>
                        
                        <div class="row">
                            <div class="col-sm-6 col-lg-3">
                                <div class="card text-white bg-primary">
                                    <div class="card-body">
                                        <div class="text-value-lg">150</div>
                                        <div>مستخدم جديد</div>
                                        <a href="users.php" class="text-white">عرض الكل</a>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- المزيد من البطاقات الإحصائية -->
                        </div>
                    </div>
                </div>
            </main>
        </div>
        
        <!-- Footer -->
        <?php include __DIR__ . '/coreui/partials/footer.php'; ?>
    </div>
</div>

<!-- أصول JavaScript -->
<script src="/assets/compiled/js/coreui.min.js"></script>
</body>
</html>