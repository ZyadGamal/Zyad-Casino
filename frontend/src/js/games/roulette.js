import { RNG } from '../utils/rng.js';
import { SoundPlayer } from '../utils/sound.js';
import { trackEvent } from '../utils/analytics.js';

export class RouletteGame {
  constructor(wallet, playerId) {
    this.wallet = wallet;
    this.playerId = playerId;
    this.dynamicRTP = 0.95; // RTP ديناميكي يبدأ بـ 95%
    this.initGame();
  }

  initGame() {
    this.betOptions = [
      { type: 'number', value: '0', payout: 36, coverage: 1 },
      { type: 'color', value: 'red', payout: 2, coverage: 18 },
      { type: 'color', value: 'black', payout: 2, coverage: 18 },
      { type: 'dozen', value: '1st12', payout: 3, coverage: 12 }
    ];

    this.history = [];
    this.adjustRTPBasedOnHistory();
  }

  async spin(betData) {
    const { amount, betOn } = betData;
    
    if (!this.validateBet(amount, betOn)) {
      throw new Error('الرهان غير صالح');
    }

    // سحب المبلغ من المحفظة
    this.wallet.withdraw(amount);

    // تشغيل صوت الرهان
    SoundPlayer.play('bet_placed');

    // تدوير العجلة مع تأثيرات
    const result = await this.animateWheelSpin();

    // حساب النتيجة
    const winAmount = this.calculateWin(result, betOn, amount);

    if (winAmount > 0) {
      this.wallet.deposit(winAmount);
      SoundPlayer.play('win');
    } else {
      SoundPlayer.play('lose');
    }

    // تسجيل النتيجة وتعديل RTP
    this.recordResult(result, betOn, winAmount > 0);
    this.adjustRTPBasedOnHistory();

    trackEvent('roulette_spin', {
      playerId: this.playerId,
      amount,
      betOn,
      result,
      winAmount,
      rtp: this.dynamicRTP
    });

    return { result, winAmount, newBalance: this.wallet.balance };
  }

  adjustRTPBasedOnHistory() {
    if (this.history.length < 10) return;

    const last10 = this.history.slice(-10);
    const winRate = last10.filter(r => r.won).length / 10;

    if (winRate < 0.3) this.dynamicRTP += 0.02;
    else if (winRate > 0.5) this.dynamicRTP -= 0.01;

    this.dynamicRTP = Math.max(0.9, Math.min(0.99, this.dynamicRTP));
  }
}