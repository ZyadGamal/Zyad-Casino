import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionTable from '../components/TransactionTable';

const AdminWalletDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (user?.isAdmin) {
      fetchTransactions();
    }
  }, [user, filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/transactions?status=${filter}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(`/admin/transactions/${id}/${action}`);
      fetchTransactions();
    } catch (error) {
      console.error(`Error ${action} transaction:`, error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">غير مصرح لك بالوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم المالية</h1>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          المعلقة
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          المقبولة
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          المرفوضة
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="جاري تحميل المعاملات..." />
      ) : (
        <TransactionTable 
          transactions={transactions} 
          onApprove={(id) => handleAction(id, 'approve')}
          onReject={(id) => handleAction(id, 'reject')}
          showActions={filter === 'pending'}
        />
      )}
    </div>
  );
};

export default AdminWalletDashboard;