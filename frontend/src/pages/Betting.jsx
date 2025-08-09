import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';
import BetSlip from '../components/BetSlip';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Betting = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        setError('فشل تحميل بيانات المباراة');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const addToSlip = (selection, odds, market) => {
    if (!user) {
      navigate('/login', { state: { from: `/bet/${eventId}` } });
      return;
    }

    const existingBet = bets.find(b => b.market === market);
    if (existingBet) {
      setBets(bets.map(b => b.market === market ? { ...b, selection, odds } : b));
    } else {
      setBets([...bets, {
        match: `${event.home_team} vs ${event.away_team}`,
        selection,
        odds,
        market,
        eventId
      }]);
    }
  };

  const removeFromSlip = (index) => {
    setBets(bets.filter((_, i) => i !== index));
  };

  const placeBet = async (amount) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/bets', {
        bets: bets.map(bet => ({
          eventId: bet.eventId,
          market: bet.market,
          selection: bet.selection,
          odds: bet.odds
        })),
        amount
      });
      
      navigate('/bets/history', { 
        state: { 
          success: `تم وضع الرهان بنجاح بمبلغ ${amount} جنيه` 
        } 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'فشل وضع الرهان');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="جاري تحميل بيانات المباراة..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4">
            {event.home_team} vs {event.away_team}
          </h1>
          <p className="text-gray-600 mb-6">
            {new Date(event.date).toLocaleString('ar-EG')} | {event.league}
          </p>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">أسواق الرهان</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">نتيجة المباراة</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => addToSlip('فوز ' + event.home_team, event.odds.home, 'match_result')}
                    className="bg-green-100 hover:bg-green-200 p-3 rounded text-center"
                  >
                    <div>{event.home_team}</div>
                    <div className="font-bold">{event.odds.home}</div>
                  </button>
                  <button 
                    onClick={() => addToSlip('تعادل', event.odds.draw, 'match_result')}
                    className="bg-blue-100 hover:bg-blue-200 p-3 rounded text-center"
                  >
                    <div>تعادل</div>
                    <div className="font-bold">{event.odds.draw}</div>
                  </button>
                  <button 
                    onClick={() => addToSlip('فوز ' + event.away_team, event.odds.away, 'match_result')}
                    className="bg-green-100 hover:bg-green-200 p-3 rounded text-center"
                  >
                    <div>{event.away_team}</div>
                    <div className="font-bold">{event.odds.away}</div>
                  </button>
                </div>
              </div>

              {/* يمكن إضافة المزيد من أسواق الرهان هنا */}
            </div>
          </div>
        </div>

        <div>
          <BetSlip 
            bets={bets} 
            onRemove={removeFromSlip} 
            onPlaceBet={placeBet} 
            userBalance={user?.balance}
          />
        </div>
      </div>
    </div>
  );
};

export default Betting;