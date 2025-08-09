import requests
from django.conf import settings
from decimal import Decimal
import logging
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self):
        self.cipher = Fernet(settings.ENCRYPTION_KEY.encode())

    def encrypt_payment_data(self, data):
        return self.cipher.encrypt(str(data).encode()).decode()

    def process_payment(self, method, amount, user):
        try:
            amount = Decimal(amount)
            
            # التحقق من حدود الإيداع
            if not self._check_deposit_limits(user, amount):
                raise ValueError('Deposit limit exceeded')
            
            # معالجة الدفع حسب الطريقة
            if method == 'paypal':
                return self._process_paypal(amount, user)
            elif method == 'vodafone':
                return self._process_vodafone(amount, user)
            else:
                raise ValueError('Unsupported payment method')
                
        except Exception as e:
            logger.error(f'Payment failed: {str(e)}', exc_info=True)
            raise

    def _process_paypal(self, amount, user):
        payload = {
            'client_id': settings.PAYPAL_CLIENT_ID,
            'amount': str(amount),
            'currency': 'USD',
            'user_id': user.id
        }
        
        # في الواقع الفعلي، هنا يتم الاتصال ببوابة PayPal
        response = {
            'success': True,
            'transaction_id': f'PP_{user.id}_{amount}',
            'amount': amount
        }
        
        logger.info(f'PayPal payment processed for user {user.id}: {amount} USD')
        return response

    def _check_deposit_limits(self, user, amount):
        daily_limit = Decimal('5000.00')
        return amount <= daily_limit