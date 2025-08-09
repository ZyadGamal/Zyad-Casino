import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const DepositWithdraw = () => {
  const { user, updateBalance } = useAuth();
  const [activeTab, setActiveTab] = useState('deposit');
  const [formData, setFormData] = useState({
    method: 'vodafone',
    amount: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAmount = (amount) => {
    const numAmount = Number(amount);
    return !isNaN(numAmount) && numAmount > 0;
  };

  const handleDeposit = async () => {
    if (!validateAmount(formData.amount)) {
      setMessage({ type: 'error', text: 'المبلغ يجب أن يكون رقمًا موجبًا' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/wallet/deposit', {
        method: formData.method,
        amount: Number(formData.amount),
        phone: formData.phone
      });
      
      updateBalance(response.data.newBalance);
      setMessage({ 
        type: 'success', 
        text: `تم تقديم طلب الإيداع بنجاح. رقم المرجع: ${response.data.transactionId}`
      });
      setFormData({ ...formData, amount: '', phone: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'حدث خطأ أثناء الإيداع'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!validateAmount(formData.amount)) {
      setMessage({ type: 'error', text: 'المبلغ يجب أن يكون رقمًا موجبًا' });
      return;
    }

    if (Number(formData.amount) > user.balance) {
      setMessage({ type: 'error', text: 'الرصيد غير كافي للسحب' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/wallet/withdraw', {
        amount: Number(formData.amount),
        phone: formData.phone
      });
      
      updateBalance(response.data.newBalance);
      setMessage({ 
        type: 'success', 
        text: `تم تقديم طلب السحب بنجاح. رقم المرجع: ${response.data.transactionId}`
      });
      setFormData({ ...formData, amount: '', phone: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'حدث خطأ أثناء السحب'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">💰 الإيداع والسحب</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'deposit' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('deposit')}
          >
            الإيداع
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'withdraw' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('withdraw')}
          >
            السحب
          </button>
        </div>

        <p className="mb-4">رصيدك الحالي: <span className="font-bold">{user?.balance || 0} جنيه</span></p>

        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">طريقة الدفع:</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="vodafone">Vodafone Cash</option>
                <option value="orange">Orange Cash</option>
                <option value="etisalat">Etisalat Cash</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">رقم المحفظة:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم الهاتف"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">المبلغ (جنيه):</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="أدخل المبلغ"
                className="w-full p-2 border rounded"
                min="10"
              />
            </div>

            <button
              onClick={handleDeposit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'جاري المعالجة...' : 'إيداع'}
            </button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">رقم المحفظة:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم الهاتف"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">المبلغ (جنيه):</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="أدخل المبلغ"
                className="w-full p-2 border rounded"
                min="10"
                max={user?.balance || 0}
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'جاري المعالجة...' : 'سحب'}
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4">
            {message.type === 'error' ? (
              <ErrorMessage message={message.text} />
            ) : (
              <SuccessMessage message={message.text} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositWithdraw;