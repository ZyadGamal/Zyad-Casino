import React from 'react';
import PropTypes from 'prop-types';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

const TransactionList = ({ transactions }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {transaction.type === 'deposit' ? (
                  <ArrowDownIcon className="h-5 w-5 text-green-500 mr-3" />
                ) : (
                  <ArrowUpIcon className="h-5 w-5 text-red-500 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} جنيه
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['deposit', 'withdraw']).isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['completed', 'pending', 'failed']).isRequired,
    })
  ).isRequired,
};

export default TransactionList;