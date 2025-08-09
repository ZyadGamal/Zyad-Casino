import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatMatchTime } from '../utils/dateUtils';
import { ClockIcon } from '@heroicons/react/24/outline';

const MatchEvent = ({ match, isAuthenticated }) => {
  return (
    <li className="px-4 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                <span className="font-bold">{match.home_team}</span> vs <span className="font-bold">{match.away_team}</span>
              </p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>
                  {match.league} • {formatMatchTime(match.event_date)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {match.status === 'live' && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
              مباشر
            </span>
          )}
          {isAuthenticated && (
            <Link 
              to={`/match/${match.id}/bet`}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              رهان
            </Link>
          )}
        </div>
      </div>
      {match.status === 'live' && match.score && (
        <div className="mt-2 flex justify-center">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">
            النتيجة: {match.score}
          </span>
        </div>
      )}
    </li>
  );
};

MatchEvent.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.number.isRequired,
    home_team: PropTypes.string.isRequired,
    away_team: PropTypes.string.isRequired,
    league: PropTypes.string.isRequired,
    event_date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    score: PropTypes.string,
  }).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default MatchEvent;