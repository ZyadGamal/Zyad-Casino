import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "../services/api";
import MatchCard from "../components/MatchCard";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    axios.get("/leagues")
      .then(res => setMatches(res.data))
      .catch(err => console.error("فشل تحميل الدوريات:", err));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold mb-6">
        🎰 مرحبًا بك في <span className="text-blue-600">Z-Casino</span> يا {user?.username || "زائر"}
      </h1>

      {/* 💰 الحساب */}
      <section className="mb-8 bg-white shadow-md p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💰 حسابك:</h2>
        <p className="mb-2">الرصيد: <strong>{user?.balance || 0} جنيه</strong></p>
        <div className="space-x-4">
          <Link to="/deposit" className="text-blue-500 hover:underline">إيداع</Link>
          <span>|</span>
          <Link to="/withdraw" className="text-blue-500 hover:underline">سحب</Link>
        </div>
      </section>

      {/* 🎮 الألعاب */}
      <section className="mb-8 bg-white shadow-md p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">🎮 الألعاب المتاحة:</h2>
        <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <li><Link to="/games/crash" className="text-purple-600 hover:underline">لعبة Crash (الطائرة)</Link></li>
          <li><Link to="/games/crystal" className="text-purple-600 hover:underline">لعبة Crystal</Link></li>
          <li><Link to="/games/gems-mines" className="text-purple-600 hover:underline">Gems & Mines</Link></li>
          <li><Link to="/games/apple" className="text-purple-600 hover:underline">Apple of Fortune</Link></li>
          <li><Link to="/games/under-over" className="text-purple-600 hover:underline">Under and Over 7</Link></li>
          <li><Link to="/games/fruit" className="text-purple-600 hover:underline">Fruit Cocktail</Link></li>
          <li><Link to="/games/plinko" className="text-purple-600 hover:underline">Plinko</Link></li>
          <li><Link to="/games/west" className="text-purple-600 hover:underline">Wild West Gold</Link></li>
          <li><Link to="/games/thimbles" className="text-purple-600 hover:underline">Thimbles</Link></li>
          <li><Link to="/games/lucky-wheel" className="text-purple-600 hover:underline">Lucky Wheel 🎡</Link></li>
        </ul>
      </section>

      {/* ⚽ المباريات */}
      <section className="mb-8 bg-white shadow-md p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">⚽ المباريات القادمة:</h2>
        <Link to="/sports" className="text-green-600 hover:underline">عرض جميع المباريات والتراهن</Link>
      </section>

      {/* 🏆 الدوريات */}
      <section>
        <h2 className="text-xl font-semibold mb-4">🏆 الدوريات المتاحة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.length > 0 ? (
            matches.map((league) => (
              <MatchCard key={league.id} league={league} />
            ))
          ) : (
            <p>جاري تحميل الدوريات...</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
