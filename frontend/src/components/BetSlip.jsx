import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { calculatePotentialWin } from '../utils/betCalculations';
import { useApi } from '../hooks/useApi';

const BetSlip = ({ bets, onRemove, onPlaceBet }) => {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { post } = useApi();

  const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);

  const handlePlaceBet = useCallback(async () => {
    setError('');
    const validationError = validateBet(user, betAmount);
    if (validationError) return setError(validationError);

    setIsSubmitting(true);
    try {
      const amount = parseFloat(betAmount);
      await post('/bets', { 
        bets: bets.map(bet => ({
          matchId: bet.matchId,
          selection: bet.selection,
          odds: bet.odds
        })),
        amount
      });
      
      updateBalance(-amount);
      onPlaceBet(amount);
      setBetAmount('');
    } catch (err) {
      setError(err.message || 'فشل في تقديم الرهان');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, betAmount, bets, post, updateBalance, onPlaceBet]);

  const validateBet = (user, amount) => {
    if (!user) return 'يجب تسجيل الدخول أولاً';
    if (!amount || amount <= 0) return 'المبلغ غير صالح';
    if (amount > user.balance) return 'الرصيد غير كافي';
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="bg-green-100 text-green-800 p-1 rounded mr-2">🎫</span>
        قسيمة الرهان
      </h3>

      {bets.length === 0 ? (
        <EmptyBetSlip />
      ) : (
        <div className="space-y-3">
          {bets.map((bet, index) => (
            <BetItem 
              key={`${bet.matchId}-${index}`} 
              bet={bet} 
              onRemove={() => onRemove(index)} 
            />
          ))}

          <BetSummary 
            totalOdds={totalOdds}
            betAmount={betAmount}
            potentialWin={calculatePotentialWin(totalOdds, betAmount)}
          />

          <BetInput 
            value={betAmount}
            maxAmount={user?.balance}
            onChange={setBetAmount}
          />

          {error && <BetError message={error} />}

          <SubmitButton
            disabled={!betAmount || bets.length === 0 || isSubmitting}
            onClick={handlePlaceBet}
            isLoading={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

// Sub-components
const EmptyBetSlip = () => (
  <p className="text-gray-500 text-center py-4">لا توجد رهانات مضافة</p>
);

const BetItem = ({ bet, onRemove }) => (
  <div className="border-b border-gray-100 pb-3">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{bet.match}</p>
        <p className="text-sm text-gray-600">
          {bet.selection} @ <span className="text-green-600">{bet.odds.toFixed(2)}</span>
        </p>
      </div>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 p-1"
        aria-label="إزالة"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const BetSummary = ({ totalOdds, potentialWin }) => (
  <>
    <div className="flex justify-between mb-2">
      <span className="text-gray-600">إجمالي الاحتمالات:</span>
      <span className="font-bold">{totalOdds.toFixed(2)}</span>
    </div>
    <div className="flex justify-between mb-4">
      <span className="text-gray-600">الصافي المحتمل:</span>
      <span className="font-bold text-green-600">{potentialWin} جنيه</span>
    </div>
  </>
);

const BetInput = ({ value, maxAmount, onChange }) => (
  <div className="mb-3">
    <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700 mb-1">
      مبلغ الرهان (جنيه)
    </label>
    <input
      id="betAmount"
      type="number"
      min="1"
      max={maxAmount || 0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="أدخل المبلغ"
    />
  </div>
);

const BetError = ({ message }) => (
  <div className="flex items-center text-red-600 text-sm mb-3">
    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
    {message}
  </div>
);

const SubmitButton = ({ disabled, onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex justify-center py-2 px-4 rounded-md text-white font-medium ${
      disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
    }`}
  >
    {isLoading ? (
      <span className="flex items-center">
        <LoadingSpinner size="small" className="mr-2" />
        جاري المعالجة...
      </span>
    ) : (
      "تأكيد الرهان"
    )}
  </button>
);

BetSlip.propTypes = {
  bets: PropTypes.arrayOf(
    PropTypes.shape({
      matchId: PropTypes.string.isRequired,
      match: PropTypes.string.isRequired,
      selection: PropTypes.string.isRequired,
      odds: PropTypes.number.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  onPlaceBet: PropTypes.func.isRequired,
};

export default BetSlip;