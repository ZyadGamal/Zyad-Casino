export class PlayerService {
  constructor() {
    this.players = new Map(); // سيكون قاعدة بيانات في التطبيق الحقيقي
  }

  register(playerData) {
    // التحقق من البريد الإلكتروني وكلمة المرور
    if (!this.validateEmail(playerData.email)) {
      throw new Error('البريد الإلكتروني غير صالح');
    }

    if (playerData.password.length < 8) {
      throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }

    const playerId = this.generatePlayerId();
    const newPlayer = {
      id: playerId,
      ...playerData,
      balance: 0,
      limits: {
        dailyDeposit: 5000,
        dailyLoss: 10000,
        sessionTime: 120 // دقيقة
      },
      createdAt: new Date()
    };

    this.players.set(playerId, newPlayer);
    return newPlayer;
  }

  setSelfExclusion(playerId, duration) {
    const player = this.players.get(playerId);
    if (!player) throw new Error('اللاعب غير موجود');

    player.selfExclusion = {
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
    };

    return player;
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  generatePlayerId() {
    return `plr_${Math.random().toString(36).substr(2, 9)}`;
  }
}