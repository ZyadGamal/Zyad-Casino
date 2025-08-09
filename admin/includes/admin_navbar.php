<nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button">
                <i class="fas fa-bars"></i>
            </a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
            <a href="/admin" class="nav-link">الرئيسية</a>
        </li>
    </ul>
    
    <ul class="navbar-nav mr-auto">
        <li class="nav-item dropdown">
            <a class="nav-link" data-toggle="dropdown" href="#">
                <i class="far fa-user"></i>
                <?= htmlspecialchars($_SESSION['user']['username'] ?? '') ?>
            </a>
            <div class="dropdown-menu dropdown-menu-right">
                <a href="/admin/profile" class="dropdown-item">الملف الشخصي</a>
                <div class="dropdown-divider"></div>
                <a href="/logout" class="dropdown-item">تسجيل الخروج</a>
            </div>
        </li>
    </ul>
</nav>