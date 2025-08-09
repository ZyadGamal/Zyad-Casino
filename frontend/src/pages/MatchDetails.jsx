import React from 'react';
import PropTypes from 'prop-types';
import { formatMatchTime } from '../utils/dateUtils';

const MatchDetails = ({ match }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          {match.home_team} vs {match.away_team}
        </h2>
        <div className="mt-2 flex flex-wrap items-center justify-between text-sm text-gray-500">
          <span>{match.league}</span>
          <span>{formatMatchTime(match.event_date)}</span>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {match.status === 'live' && match.score && (
          <div className="text-center mb-4">
            <span className="text-2xl font-bold">{match.score}</span>
          </div>
        )}
        <p className="text-gray-600">{match.description || 'لا يوجد وصف متاح'}</p>
      </div>
    </div>
  );
};

MatchDetails.propTypes = {
  match: PropTypes.object.isRequired,
};

export default MatchDetails;