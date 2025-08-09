import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import LeagueFilter from '../components/LeagueFilter';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';

const Sports = () => {
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leaguesRes, matchesRes] = await Promise.all([
          axios.get('/leagues'),
          axios.get('/matches')
        ]);
        
        setLeagues(leaguesRes.data);
        setMatches(matchesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMatches = selectedLeagues.length > 0
    ? matches.filter(match => selectedLeagues.includes(match.league_id))
    : matches;

  if (loading) return <LoadingSpinner message="جاري تحميل البيانات..." />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">المراهنات الرياضية</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <LeagueFilter 
            leagues={leagues}
            selectedLeagues={selectedLeagues}
            onChange={setSelectedLeagues}
          />
        </div>
        
        <div className="lg:col-span-3">
          <MatchList 
            matches={filteredMatches}
            onMatchClick={(matchId) => navigate(`/bet/${matchId}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default Sports;