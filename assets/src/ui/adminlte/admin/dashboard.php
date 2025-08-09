<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> | <?= APP_NAME ?></title>
    
    <!-- أصول AdminLTE مع RTL -->
    <link rel="stylesheet" href="/assets/compiled/css/adminlte.min.css">
    <link rel="stylesheet" href="/assets/compiled/css/adminlte-rtl.min.css">
    <link rel="stylesheet" href="/assets/compiled/css/font-awesome.min.css">
</head>
<body class="hold-transition sidebar-mini rtl">
<div class="wrapper">

    <!-- شريط التنقل العلوي -->
    <?php include __DIR__ . '/adminlte/partials/navbar.php'; ?>
    
    <!-- القائمة الجانبية -->
    <?php include __DIR__ . '/adminlte/partials/sidebar.php'; ?>

    <!-- المحتوى الرئيسي -->
    <div class="content-wrapper">
        <section class="content-header">
            <h1><?= $pageTitle ?></h1>
        </section>

        <section class="content">
            <div class="container-fluid">
                <!-- إحصائيات سريعة -->
                <div class="row">
                    <div class="col-lg-3 col-6">
                        <div class="small-box bg-info">
                            <div class="inner">
                                <h3>150</h3>
                                <p>مستخدم جديد</p>
                            </div>
                            <div class="icon">
                                <i class="fa fa-users"></i>
                            </div>
                            <a href="users.php" class="small-box-footer">المزيد <i class="fa fa-arrow-circle-left"></i></a>
                        </div>
                    </div>
                    
                    <!-- المزيد من البطاقات الإحصائية -->
                </div>
            </div>
        </section>
    </div>

    <!-- تذييل الصفحة -->
    <?php include __DIR__ . '/adminlte/partials/footer.php'; ?>
</div>

<!-- أصول JavaScript -->
<script src="/assets/compiled/js/adminlte.min.js"></script>
</body>
</html>