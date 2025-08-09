import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrophyIcon } from '@heroicons/react/24/outline';

const MatchCard = ({ league, className = '' }) => {
  const { user } = useAuth();

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{league.name}</h2>
          <p className="text-sm text-gray-600">{league.country}</p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          {league.matches_count} مباراة
        </span>
      </div>
      
      {user ? (
        <Link 
          to={`/league/${league.id}`}
          className="mt-3 inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
        >
          عرض المباريات
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1 mt-0.5"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          سجل الدخول لمشاهدة المباريات
        </p>
      )}
    </div>
  );
};

MatchCard.propTypes = {
  league: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    matches_count: PropTypes.number
  }).isRequired,
  className: PropTypes.string
};

export default MatchCard;