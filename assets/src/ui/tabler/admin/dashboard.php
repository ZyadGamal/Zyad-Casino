<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> | <?= APP_NAME ?></title>
    
    <!-- أصول Tabler مع RTL -->
    <link rel="stylesheet" href="/assets/compiled/css/tabler.min.css">
    <link rel="stylesheet" href="/assets/compiled/css/tabler-rtl.min.css">
</head>
<body>
<div class="page">
    <!-- Header -->
    <?php include __DIR__ . '/tabler/partials/header.php'; ?>
    
    <!-- Navbar -->
    <?php include __DIR__ . '/tabler/partials/navbar.php'; ?>

    <!-- المحتوى الرئيسي -->
    <div class="page-wrapper">
        <div class="container-xl">
            <div class="page-header d-print-none">
                <h1 class="page-title"><?= $pageTitle ?></h1>
            </div>
        </div>
        
        <div class="page-body">
            <div class="container-xl">
                <div class="row row-deck row-cards">
                    <div class="col-sm-6 col-lg-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <div class="subheader">المستخدمون</div>
                                </div>
                                <div class="h1 mb-3">150</div>
                                <div class="d-flex mb-2">
                                    <div>مستخدم جديد</div>
                                    <div class="ms-auto">
                                        <a href="users.php" class="text-reset">عرض الكل</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- المزيد من البطاقات الإحصائية -->
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <?php include __DIR__ . '/tabler/partials/footer.php'; ?>
</div>

<!-- أصول JavaScript -->
<script src="/assets/compiled/js/tabler.min.js"></script>
</body>
</html>