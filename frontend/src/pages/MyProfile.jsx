import { useEffect, useState, useContext } from "react";
import axios from "../services/api";
import { AuthContext } from "../context/AuthContext";

const MyProfile = () => {
  const { user } = useContext(AuthContext); // نحصل على المستخدم من الكونتكست
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    // جلب المعاملات
    axios.get(`/wallet/transactions?user_id=${user.id}`)
      .then(res => setTransactions(res.data))
      .catch(err => console.error("خطأ في جلب المعاملات:", err));
  }, [user]);

  if (!user) return <p className="text-center mt-10 text-gray-600">جارٍ التحميل...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">👤 حسابي</h2>

      <div className="mb-6">
        <p><strong>الاسم:</strong> {user.username}</p>
        <p><strong>البريد / رقم الهاتف:</strong> {user.email || user.phone}</p>
        <p><strong>الرصيد الحالي:</strong> <span className="text-green-600">{user.balance} جنيه</span></p>
      </div>

      <hr className="mb-4" />

      <h3 className="text-xl font-semibold mb-2">🧾 سجل المعاملات</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="px-4 py-2">النوع</th>
              <th className="px-4 py-2">المبلغ</th>
              <th className="px-4 py-2">الوسيلة</th>
              <th className="px-4 py-2">الحالة</th>
              <th className="px-4 py-2">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-t">
                <td className="px-4 py-2">{tx.type === 'deposit' ? 'إيداع' : 'سحب'}</td>
                <td className="px-4 py-2">{tx.amount} جنيه</td>
                <td className="px-4 py-2">{tx.method || '-'}</td>
                <td className={`px-4 py-2 ${tx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {tx.status === 'completed' ? 'تم' : 'معلق'}
                </td>
                <td className="px-4 py-2">{new Date(tx.timestamp).toLocaleString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyProfile;
