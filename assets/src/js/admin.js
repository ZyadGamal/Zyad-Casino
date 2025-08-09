$(document).ready(function() {
    // تفعيل عناصر واجهة المستخدم
    $('[data-toggle="tooltip"]').tooltip();
    
    // إدارة القوائم الجانبية
    $('.sidebar-menu a').on('click', function() {
        $('.sidebar-menu li').removeClass('active');
        $(this).parent().addClass('active');
    });
    
    // التحقق من انتهاء الجلسة
    function checkSession() {
        $.get('includes/session_check.php', function(response) {
            if (response === 'expired') {
                window.location.href = '../index.php?session=expired';
            }
        });
    }
    
    // التحقق كل 5 دقائق
    setInterval(checkSession, 300000);
    
    // إدارة البحث
    $('.search-box button').on('click', function() {
        const searchTerm = $('.search-box input').val();
        if (searchTerm.trim() !== '') {
            alert('سيتم البحث عن: ' + searchTerm);
            // يمكنك هنا إضافة Ajax للبحث
        }
    });
    
    $('.search-box input').on('keypress', function(e) {
        if (e.which === 13) {
            $('.search-box button').click();
        }
    });
});