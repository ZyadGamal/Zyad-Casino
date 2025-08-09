import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import MatchEvent from './MatchEvent';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchLiveMatches } from '../api/matches';

const LiveMatches = ({ initialMatches = [] }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState(!initialMatches.length);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { data: liveUpdate } = useWebSocket('/ws/live-matches');

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLiveMatches(user?.token);
      setMatches(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError({
        title: "خطأ في تحميل المباريات",
        message: "فشل تحميل المباريات الحية. يرجى المحاولة لاحقاً"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initialMatches.length) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchMatches, initialMatches]);

  useEffect(() => {
    if (liveUpdate) {
      setMatches(prev => prev.map(m => 
        m.id === liveUpdate.match_id ? { ...m, ...liveUpdate.data } : m
      ));
      setLastUpdated(new Date());
    }
  }, [liveUpdate]);

  if (loading) return <LoadingSpinner message="جارٍ تحميل المباريات..." />;
  if (error) return <ErrorMessage {...error} onRetry={fetchMatches} />;
  if (!matches.length) return (
    <EmptyState
      title="لا توجد مباريات حالية"
      description="لا توجد مباريات حية تعرض حالياً. يرجى المحاولة لاحقاً"
      actionText="تحديث البيانات"
      onAction={fetchMatches}
      icon="⚽"
    />
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">🏆 المباريات الحية</h2>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            آخر تحديث: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <ul className="divide-y divide-gray-200">
        {matches.map((match) => (
          <MatchEvent 
            key={`${match.id}-${match.status}`}
            match={match}
            isAuthenticated={!!user}
          />
        ))}
      </ul>
    </div>
  );
};

LiveMatches.propTypes = {
  initialMatches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      home_team: PropTypes.string.isRequired,
      away_team: PropTypes.string.isRequired,
      league: PropTypes.string.isRequired,
      event_date: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      score: PropTypes.string,
    })
  ),
};

export default LiveMatches;