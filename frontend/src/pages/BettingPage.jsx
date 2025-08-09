import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import MatchDetails from '../components/MatchDetails';
import OddsCard from '../components/OddsCard';
import BetSlip from '../components/BetSlip';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const BettingPage = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { get } = useApi();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bets, setBets] = useState([]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const data = await get(`/matches/${matchId}`);
        setMatch(data);
      } catch (err) {
        console.error('Failed to fetch match:', err);
        setError('فشل تحميل بيانات المباراة');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, get]);

  const handleAddToBetSlip = (bet) => {
    if (!user) {
      showNotification('warning', 'يجب تسجيل الدخول لإضافة رهان');
      navigate('/login', { state: { from: `/match/${matchId}/bet` } });
      return;
    }

    const isAlreadyAdded = bets.some(b => b.matchId === bet.matchId && b.selection === bet.selection);
    if (isAlreadyAdded) {
      showNotification('info', 'تم إضافة هذا الرهان مسبقاً');
      return;
    }

    setBets(prev => [...prev, bet]);
    showNotification('success', 'تم إضافة الرهان إلى القسيمة');
  };

  const handleRemoveBet = (index) => {
    setBets(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlaceBet = async (amount) => {
    try {
      // سيتم التعامل مع عملية الرهان في مكون BetSlip
      showNotification('success', 'تم تقديم الرهان بنجاح');
      setBets([]);
    } catch (err) {
      showNotification('error', err.message || 'فشل في تقديم الرهان');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!match) return <ErrorMessage message="المباراة غير متوفرة" />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MatchDetails match={match} />
          <OddsCard 
            match={match} 
            onAddToBetSlip={handleAddToBetSlip}
          />
        </div>
        
        <div className="lg:col-span-1">
          <BetSlip 
            bets={bets} 
            onRemove={handleRemoveBet} 
            onPlaceBet={handlePlaceBet}
          />
        </div>
      </div>
    </div>
  );
};

export default BettingPage;