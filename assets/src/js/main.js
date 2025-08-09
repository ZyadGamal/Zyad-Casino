// التحقق من CSRF Token لجميع طلبات AJAX
$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
    }
});

// إدارة الجلسة
function checkSession() {
    fetch('/includes/session_check.php')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/index.php?error=session_expired';
            }
        });
}

// التحقق من الجلسة كل 5 دقائق
setInterval(checkSession, 300000);

// إدارة كلمة المرور
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// إدارة الأحداث
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة المكونات
    initTooltips();
    initModals();
    
    // تسجيل النشاط
    logActivity('Page loaded');
});