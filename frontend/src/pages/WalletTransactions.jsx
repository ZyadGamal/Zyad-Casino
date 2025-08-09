import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TransactionList from '../components/TransactionList';
import WalletSummary from '../components/WalletSummary';
import DepositForm from '../components/DepositForm';
import WithdrawForm from '../components/WithdrawForm';
import { Tab } from '@headlessui/react';

const WalletTransactions = () => {
  const { user } = useAuth();
  const { get, post } = useApi();
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('deposit');

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const data = await get('/wallet/transactions');
        setTransactions(data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('فشل تحميل سجل المعاملات');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, get]);

  const handleDeposit = async (amount) => {
    try {
      const response = await post('/wallet/deposit', { amount });
      showNotification('success', `تم إيداع ${amount} جنيه بنجاح`);
      // تحديث الرصيد وسجل المعاملات
      setTransactions(prev => [response.transaction, ...prev]);
    } catch (err) {
      showNotification('error', err.message || 'فشل في عملية الإيداع');
    }
  };

  const handleWithdraw = async (amount) => {
    try {
      const response = await post('/wallet/withdraw', { amount });
      showNotification('success', `تم سحب ${amount} جنيه بنجاح`);
      // تحديث الرصيد وسجل المعاملات
      setTransactions(prev => [response.transaction, ...prev]);
    } catch (err) {
      showNotification('error', err.message || 'فشل في عملية السحب');
    }
  };

  if (!user) {
    return (
      <EmptyState 
        title="يجب تسجيل الدخول"
        description="سجل الدخول لعرض سجل المعاملات وإدارة رصيدك"
        actionText="تسجيل الدخول"
        onAction={() => navigate('/login')}
        icon="🔒"
      />
    );
  }

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mx-auto px-4 py-6">
      <WalletSummary balance={user.balance} />
      
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <Tab.Group onChange={(index) => setActiveTab(index === 0 ? 'deposit' : 'withdraw')}>
          <Tab.List className="flex border-b border-gray-200">
            <Tab className={({ selected }) => 
              `px-4 py-2 text-sm font-medium ${selected ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`
            }>
              إيداع رصيد
            </Tab>
            <Tab className={({ selected }) => 
              `px-4 py-2 text-sm font-medium ${selected ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`
            }>
              سحب رصيد
            </Tab>
          </Tab.List>
          <Tab.Panels className="p-4">
            <Tab.Panel>
              <DepositForm onSubmit={handleDeposit} />
            </Tab.Panel>
            <Tab.Panel>
              <WithdrawForm onSubmit={handleWithdraw} maxAmount={user.balance} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">سجل المعاملات</h2>
        {transactions.length === 0 ? (
          <EmptyState 
            title="لا توجد معاملات"
            description="لم تقم بأي عمليات إيداع أو سحب حتى الآن"
            icon="📊"
          />
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default WalletTransactions;