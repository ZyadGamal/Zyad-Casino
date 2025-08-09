$(document).ready(function() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        // إظهار تحميل
        $('button[type="submit"]').html('<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...');
        
        // إرسال البيانات عبر Ajax
        $.ajax({
            url: 'includes/auth.php',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    // تسجيل الدخول ناجح
                    $('#loginMessage').removeClass('error').addClass('success').text('تسجيل الدخول ناجح! جاري التوجيه...').show();
                    setTimeout(function() {
                        window.location.href = response.redirect;
                    }, 1000);
                } else {
                    // خطأ في تسجيل الدخول
                    $('#loginMessage').removeClass('success').addClass('error').text(response.message).show();
                    $('.login-container').addClass('shake');
                    setTimeout(function() {
                        $('.login-container').removeClass('shake');
                    }, 500);
                }
            },
            error: function() {
                $('#loginMessage').removeClass('success').addClass('error').text('حدث خطأ في الاتصال بالخادم').show();
            },
            complete: function() {
                $('button[type="submit"]').html('<i class="fas fa-sign-in-alt"></i> تسجيل الدخول');
            }
        });
    });
    
    // إظهار/إخفاء كلمة المرور
    window.togglePassword = function() {
        const passwordField = $('#password');
        const icon = $('.toggle-password i');
        
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordField.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    };
});