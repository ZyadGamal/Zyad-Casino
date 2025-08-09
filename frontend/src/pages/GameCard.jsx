import React from 'react';
import PropTypes from 'prop-types';

const GameCard = ({ game, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-left ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-start mb-3">
        <span className="text-3xl mr-3">{game.icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{game.title}</h3>
          <p className="text-sm text-gray-600">{game.category}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">الحد الأدنى: {game.minBet} جنيه</span>
        {disabled && (
          <span className="text-yellow-600 text-xs">يتطلب تسجيل الدخول</span>
        )}
      </div>
    </button>
  );
};

GameCard.propTypes = {
  game: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default GameCard;