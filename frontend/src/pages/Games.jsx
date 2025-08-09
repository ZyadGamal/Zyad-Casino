import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import EmptyState from '../components/EmptyState';
import GameCard from '../components/GameCard';
import SectionHeader from '../components/SectionHeader';

const Games = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // بيانات وهمية للألعاب - يمكن استبدالها ببيانات حقيقية من API
  const games = [
    {
      id: 1,
      title: "روليت",
      description: "لعبة الروليت الكلاسيكية مع مختلف أنواع الرهانات",
      icon: "🎰",
      minBet: 10,
      category: "كازينو"
    },
    {
      id: 2,
      title: "بلاك جاك",
      description: "تحدي الموزع للوصول إلى 21 نقطة",
      icon: "🃏",
      minBet: 20,
      category: "كازينو"
    },
    {
      id: 3,
      title: "سلوتس",
      description: "آلات السلوتس مع جوائز كبيرة",
      icon: "🎰",
      minBet: 5,
      category: "كازينو"
    },
    {
      id: 4,
      title: "بوكر",
      description: "بطولة بوكر أسبوعية مع لاعبين حقيقيين",
      icon: "♠️",
      minBet: 50,
      category: "بطولات"
    }
  ];

  const handleGameSelect = (game) => {
    if (!user) {
      showNotification('warning', 'يجب تسجيل الدخول للعب');
      return;
    }
    // يمكن توجيه المستخدم إلى صفحة اللعبة المحددة
    showNotification('info', `سيتم فتح لعبة ${game.title}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <SectionHeader 
        title="ألعاب الكازينو"
        description="اختر من بين مجموعة متنوعة من الألعاب المثيرة"
      />
      
      {games.length === 0 ? (
        <EmptyState 
          title="لا توجد ألعاب متاحة حالياً"
          description="سيتم إضافة ألعاب جديدة قريباً"
          icon="🎮"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => handleGameSelect(game)}
              disabled={!user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;