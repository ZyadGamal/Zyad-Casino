import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../hooks/useNotification';

const OddsCard = ({ match, onAddToBetSlip }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const handleBetSelection = (selection, odds) => {
    if (!user) {
      showNotification('warning', 'يجب تسجيل الدخول لإضافة رهان');
      return;
    }
    
    onAddToBetSlip({
      matchId: match.id,
      match: `${match.home_team} vs ${match.away_team}`,
      selection,
      odds
    });
  };

  const betTypes = [
    {
      title: "نتيجة المباراة",
      bets: [
        { label: match.home_team, odds: match.home_odds, selection: `${match.home_team} فوز` },
        { label: "تعادل", odds: match.draw_odds, selection: "تعادل" },
        { label: match.away_team, odds: match.away_odds, selection: `${match.away_team} فوز` }
      ]
    },
    {
      title: "مجموع الأهداف",
      bets: [
        { label: "أكثر من 2.5", odds: match.over_25_odds, selection: "أكثر من 2.5 هدف" },
        { label: "أقل من 2.5", odds: match.under_25_odds, selection: "أقل من 2.5 هدف" }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">نسب الرهان</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {betTypes.map((type, index) => (
          <div key={index} className="px-4 py-3">
            <h4 className="text-xs font-medium text-gray-500 mb-2">{type.title}</h4>
            <div className={`grid gap-2 ${type.bets.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {type.bets.map((bet, betIndex) => (
                <OddsButton 
                  key={betIndex}
                  label={bet.label}
                  odds={bet.odds}
                  onClick={() => handleBetSelection(bet.selection, bet.odds)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm text-center">
          سجل الدخول لإضافة رهان
        </div>
      )}
    </div>
  );
};

const OddsButton = ({ label, odds, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
  >
    <span className="text-xs text-gray-600">{label}</span>
    <span className="flex items-center text-green-600 font-bold mt-1">
      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
      {odds.toFixed(2)}
    </span>
  </button>
);

OddsCard.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.number.isRequired,
    home_team: PropTypes.string.isRequired,
    away_team: PropTypes.string.isRequired,
    home_odds: PropTypes.number.isRequired,
    draw_odds: PropTypes.number.isRequired,
    away_odds: PropTypes.number.isRequired,
    over_25_odds: PropTypes.number.isRequired,
    under_25_odds: PropTypes.number.isRequired,
  }).isRequired,
  onAddToBetSlip: PropTypes.func.isRequired,
};

export default OddsCard;