import { Wallet } from './utils/wallet.js';
import { loadGames } from './games/gameLoader.js';

class CasinoApp {
  constructor() {
    this.wallet = new Wallet(1000); // رصيد ابتدائي
    this.init();
  }

  async init() {
    this.setupUI();
    await loadGames();
    this.updateBalance();
  }
import { CasinoApp } from './app/core.js';
import { AuthService } from './services/authService.js';
import { PaymentService } from './services/paymentService.js';
import { NotificationService } from './services/notificationService.js';
import { Analytics } from './utils/analytics.js';

class ZyadCasino {
  constructor() {
    this.init();
  }

  async init() {
    // تهيئة الخدمات
    this.auth = new AuthService();
    this.payment = new PaymentService();
    this.notifications = new NotificationService();
    
    // تتبع التحليلات
    Analytics.init();

    // تحميل التطبيق الرئيسي
    this.casinoApp = new CasinoApp();

    // طلب إذن الإشعارات
    await this.notifications.requestPermission();
  }
}

// بدء التطبيق
new ZyadCasino();
  setupUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="py-3 mb-4 border-bottom">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h4">Zyad Casino</h1>
          <div id="wallet-balance" class="badge bg-primary">${this.wallet.balance} نقطة</div>
        </div>
      </header>
      <main id="game-container" class="row g-4"></main>
    `;
  }

  updateBalance() {
    const balanceElement = document.getElementById('wallet-balance');
    balanceElement.textContent = `${this.wallet.balance} نقطة`;
  }
}

new CasinoApp();