import { PlayerService } from '../services/playerService.js';
import { PaymentService } from '../services/paymentService.js';

export class AdminDashboard {
  static async getPlayerStats(playerId) {
    const player = await PlayerService.getPlayer(playerId);
    const transactions = await PaymentService.getTransactions(playerId);
    
    return {
      playerInfo: {
        id: player.id,
        username: player.username,
        balance: player.balance,
        lastLogin: player.lastLogin
      },
      gamingStats: {
        totalWagered: transactions.reduce((sum, t) => sum + t.amount, 0),
        favoriteGame: this.calculateFavoriteGame(player),
        rtp: this.calculatePlayerRTP(player)
      },
      limits: player.limits
    };
  }

  static async sendAlert(alertData) {
    // إرسال تنبيه إلى Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_GROUP_ID,
        text: `⚠️ تنبيه إداري:\n${alertData.message}`
      })
    });

    return telegramResponse.ok;
  }
}