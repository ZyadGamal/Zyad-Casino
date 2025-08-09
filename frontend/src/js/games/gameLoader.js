import { RouletteGame } from './roulette.js';

export async function loadGames() {
  // يمكن جلب قائمة الألعاب من API في المستقبل
  const games = [
    { id: 'roulette', name: 'روليت', class: RouletteGame }
  ];

  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) return;

  // هنا يمكنك تحميل الألعاب حسب الحاجة
  const roulette = new RouletteGame(window.casinoApp.wallet);
}